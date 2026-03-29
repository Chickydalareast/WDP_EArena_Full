'use client';

import React, { useState } from 'react';
import { useFolderTree } from '../hooks/useBankQueries';
import { FolderNodeItem } from './FolderNodeItem';
import { FolderFormModal, DeleteFolderConfirmModal } from './FolderActionModals';
import { FolderNode } from '../types/question-bank.schema';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Button } from '@/shared/components/ui/button';
import { FolderPlus, ServerCrash } from 'lucide-react';

export function FolderSidebar() {
    const { data: treeData, isLoading, isError } = useFolderTree();

    // State điều khiển Modal
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // State lưu Data cho Modal
    const [targetFolder, setTargetFolder] = useState<FolderNode | null>(null);
    const [parentIdForNew, setParentIdForNew] = useState<string | null>(null);

    // Router handler từ component con bắn lên
    const handleAction = (action: 'CREATE_CHILD' | 'EDIT' | 'DELETE', node: FolderNode) => {
        setTargetFolder(node);
        if (action === 'CREATE_CHILD') {
            setParentIdForNew(node._id);
            setTargetFolder(null); // Không truyền data sửa, chỉ truyền parentId
            setIsFormModalOpen(true);
        } else if (action === 'EDIT') {
            setIsFormModalOpen(true);
        } else if (action === 'DELETE') {
            setIsDeleteModalOpen(true);
        }
    };

    const handleCreateRoot = () => {
        setTargetFolder(null);
        setParentIdForNew(null);
        setIsFormModalOpen(true);
    };

    return (
        <div className="w-full h-full flex flex-col bg-slate-50/50 border-r border-slate-200">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                <h2 className="font-bold text-slate-800 tracking-tight text-sm uppercase">Cây Thư Mục</h2>
                <Button variant="ghost" size="icon" onClick={handleCreateRoot} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Tạo thư mục gốc">
                    <FolderPlus className="w-5 h-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200">
                {isLoading ? (
                    <div className="space-y-2 py-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-2 px-2"><Skeleton className="w-4 h-4 rounded-full shrink-0" /><Skeleton className="h-5 w-full rounded" /></div>
                        ))}
                    </div>
                ) : isError ? (
                    <div className="p-4 text-center text-red-500 text-sm flex flex-col items-center">
                        <ServerCrash className="w-8 h-8 mb-2 opacity-50" /> Không thể tải thư mục
                    </div>
                ) : treeData && treeData.length > 0 ? (
                    <div className="pb-8">
                        {treeData.map((node) => (
                            <FolderNodeItem key={node._id} node={node} level={0} onAction={handleAction} />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center text-slate-400 text-sm">
                        Chưa có thư mục nào. Nhấn biểu tượng <strong>+</strong> để tạo.
                    </div>
                )}
            </div>

            {/* SHARED MODALS CỦA TOÀN BỘ CÂY */}
            <FolderFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                folderToEdit={targetFolder}
                parentIdForNew={parentIdForNew}
            />
            <DeleteFolderConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                folderToDelete={targetFolder}
            />
        </div>
    );
}