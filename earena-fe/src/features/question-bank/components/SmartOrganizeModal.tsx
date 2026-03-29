'use client';

import React, { useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, AlertCircle, Map, Target } from 'lucide-react';

import { useQuestionBankStore } from '../stores/question-bank.store';
import { usePreviewOrganize, useExecuteOrganize } from '../hooks/useBankMutations';
import { useFolderTree } from '../hooks/useBankQueries';
import { OrganizeQuestionsPayloadSchema, OrganizeQuestionsPayload, FolderNode } from '../types/question-bank.schema';
import { buildVirtualTree } from '../lib/tree-utils';
import { VirtualNodeItem } from './VirtualNodeItem';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';

// Hằng số định danh cho trường hợp không chọn thư mục gốc
const ROOT_FOLDER_VALUE = 'ROOT_FOLDER_NONE';

const flattenFolders = (nodes: FolderNode[], level = 0): { id: string; name: string; level: number }[] => {
    let result: { id: string; name: string; level: number }[] = [];
    nodes.forEach(node => {
        result.push({ id: node._id, name: node.name, level });
        if (node.children && node.children.length > 0) {
            result = result.concat(flattenFolders(node.children, level + 1));
        }
    });
    return result;
};

interface SmartOrganizeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SmartOrganizeModal({ isOpen, onClose }: SmartOrganizeModalProps) {
    const selectedIds = useQuestionBankStore(state => state.selectedQuestionIds);
    const clearSelection = useQuestionBankStore(state => state.clearQuestionSelection);

    const { data: treeData } = useFolderTree();
    const flatExistingFolders = useMemo(() => treeData ? flattenFolders(treeData) : [], [treeData]);

    const form = useForm<OrganizeQuestionsPayload>({
        resolver: zodResolver(OrganizeQuestionsPayloadSchema),
        defaultValues: { 
            questionIds: [], 
            strategy: 'TOPIC_AND_DIFFICULTY', 
            baseFolderId: ROOT_FOLDER_VALUE 
        },
    });

    const previewMutation = usePreviewOrganize();
    const executeMutation = useExecuteOrganize();

    useEffect(() => {
        if (isOpen) {
            form.reset({ 
                questionIds: selectedIds, 
                strategy: 'TOPIC_AND_DIFFICULTY', 
                baseFolderId: ROOT_FOLDER_VALUE 
            });
            previewMutation.reset();
            executeMutation.reset();
        }
    }, [isOpen]);

    const virtualTree = useMemo(() => {
        if (!previewMutation.data) return [];
        return buildVirtualTree(previewMutation.data.virtualTree, previewMutation.data.mappings);
    }, [previewMutation.data]);

    const handleExecute = () => {
        const data = form.getValues();
        // Đánh chặn: Biến ROOT_FOLDER_VALUE thành undefined để đúng Data Contract của BE
        const payload: OrganizeQuestionsPayload = {
            ...data,
            baseFolderId: data.baseFolderId === ROOT_FOLDER_VALUE ? undefined : data.baseFolderId
        };

        executeMutation.mutate(payload, {
            onSuccess: () => {
                clearSelection();
                onClose();
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[650px] max-h-[85vh] flex flex-col">
                <DialogHeader className="shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {!previewMutation.data ? (
                            <><Target className="w-5 h-5 text-primary" /> Cấu hình Phân luồng Tự động</>
                        ) : (
                            <><Map className="w-5 h-5 text-primary" /> Kiểm tra Bản đồ Thư mục ảo</>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2 py-4">
                    {!previewMutation.data && (
                        <Form {...form}>
                            <form 
                                id="organize-form" 
                                onSubmit={form.handleSubmit((data) => {
                                    const payload = {
                                        ...data,
                                        baseFolderId: data.baseFolderId === ROOT_FOLDER_VALUE ? undefined : data.baseFolderId
                                    };
                                    previewMutation.mutate(payload);
                                })} 
                                className="space-y-5"
                            >
                                <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-sm text-slate-700">
                                    Hệ thống sẽ dựa vào <strong>Chuyên đề</strong> và <strong>Độ khó</strong> của {selectedIds.length} câu hỏi đã chọn để tự động gom nhóm và sinh ra các thư mục tương ứng.
                                </div>

                                <FormField
                                    control={form.control}
                                    name="strategy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-slate-800">Chiến lược sắp xếp <span className="text-red-500">*</span></FormLabel>
                                            <Select disabled={previewMutation.isPending} onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Chọn chiến lược" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="TOPIC_AND_DIFFICULTY">Gom theo Chuyên đề {'>'} Phân tách Mức độ (Khuyên dùng)</SelectItem>
                                                    <SelectItem value="TOPIC_STRICT">Chỉ gom theo Chuyên đề chung</SelectItem>
                                                    <SelectItem value="FLAT_DIFFICULTY">Chỉ chia theo Mức độ (Không phân Chuyên đề)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="baseFolderId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-semibold text-slate-800">Thư mục gốc (Tùy chọn)</FormLabel>
                                            <Select disabled={previewMutation.isPending} onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="-- Đặt tại ngoài cùng --" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="max-h-[250px]">
                                                    <SelectItem value={ROOT_FOLDER_VALUE}>-- Đặt tại ngoài cùng --</SelectItem>
                                                    {flatExistingFolders.map(folder => (
                                                        <SelectItem key={folder.id} value={folder.id}>
                                                            {/* Tạo khoảng lùi ảo cho cây thư mục */}
                                                            {'—'.repeat(folder.level)} {folder.level > 0 ? ' ' : ''}{folder.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <div className="text-xs text-slate-500 mt-1">Nếu chọn, toàn bộ thư mục tự động sẽ được nhét vào bên trong thư mục này.</div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    )}

                    {previewMutation.data && (
                        <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                                <div>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Tổng số câu phân loại</p>
                                    <p className="text-2xl font-black text-slate-800">{previewMutation.data.stats.totalQuestions}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-primary uppercase font-bold tracking-wider mb-1">Thư mục sẽ tạo mới</p>
                                    <p className="text-2xl font-black text-primary">{previewMutation.data.stats.newFoldersToCreate}</p>
                                </div>
                            </div>

                            {previewMutation.data.stats.unclassifiedQuestions > 0 && (
                                <div className="flex gap-3 bg-red-50 border border-red-200 p-4 rounded-lg text-red-800">
                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                                    <div>
                                        <h4 className="font-bold text-sm">Chú ý: Có câu hỏi chưa gán thuộc tính</h4>
                                        <p className="text-xs mt-1">
                                            Có <strong>{previewMutation.data.stats.unclassifiedQuestions}</strong> câu hỏi chưa được chọn Chuyên đề hoặc Mức độ. Hệ thống sẽ bơ đi và để lại vị trí cũ.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-slate-800 mb-2">Bản đồ mô phỏng:</h3>
                                <div className="border border-slate-200 rounded-lg bg-white p-3 min-h-[250px] shadow-inner">
                                    {virtualTree.length > 0 ? (
                                        virtualTree.map(node => <VirtualNodeItem key={node._id} node={node} />)
                                    ) : (
                                        <div className="text-center text-slate-400 py-10 text-sm">Không thể phân loại các câu hỏi này.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-4 border-t shrink-0">
                    {!previewMutation.data ? (
                        <>
                            <Button variant="ghost" onClick={onClose}>Hủy bỏ</Button>
                            <Button form="organize-form" type="submit" disabled={previewMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                {previewMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang mô phỏng...</> : "Xem trước sơ đồ"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => previewMutation.reset()} disabled={executeMutation.isPending}>
                                Quay lại sửa
                            </Button>
                            <Button onClick={handleExecute} disabled={executeMutation.isPending} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                                {executeMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang chốt hạ...</> : "Xác nhận & Ghi vào CSDL"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}