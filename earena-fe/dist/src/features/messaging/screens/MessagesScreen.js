'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesScreen = MessagesScreen;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const react_query_1 = require("@tanstack/react-query");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const messaging_api_1 = require("../api/messaging-api");
const MessageBubble_1 = require("../components/MessageBubble");
const messaging_query_keys_1 = require("../lib/messaging-query-keys");
const useMessagingUnreadCount_1 = require("../hooks/useMessagingUnreadCount");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const card_1 = require("@/shared/components/ui/card");
const popover_1 = require("@/shared/components/ui/popover");
const routes_1 = require("@/config/routes");
const useMediaUpload_1 = require("@/shared/hooks/useMediaUpload");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const utils_1 = require("@/shared/lib/utils");
const direct_message_policy_1 = require("../lib/direct-message-policy");
function MessagesScreen({ basePath }) {
    const searchParams = (0, navigation_1.useSearchParams)();
    const peerFromUrl = searchParams.get('peer');
    const qc = (0, react_query_1.useQueryClient)();
    const [activeThreadId, setActiveThreadId] = (0, react_1.useState)(null);
    const [draft, setDraft] = (0, react_1.useState)('');
    const [shareCourseId, setShareCourseId] = (0, react_1.useState)('');
    const [shareCourseLabel, setShareCourseLabel] = (0, react_1.useState)('');
    const [sharePopoverOpen, setSharePopoverOpen] = (0, react_1.useState)(false);
    const [shareFilter, setShareFilter] = (0, react_1.useState)('');
    const bottomRef = (0, react_1.useRef)(null);
    const lastOpenedPeerRef = (0, react_1.useRef)(null);
    const { uploadMedia, isUploading } = (0, useMediaUpload_1.useMediaUpload)();
    const threadsQ = (0, react_query_1.useQuery)({
        queryKey: messaging_query_keys_1.messagingQueryKeys.threads,
        queryFn: messaging_api_1.listThreads,
        refetchOnWindowFocus: true,
    });
    const openPeer = (0, react_query_1.useMutation)({
        mutationFn: (peerUserId) => (0, messaging_api_1.openThread)(peerUserId),
        onSuccess: (data) => {
            setActiveThreadId(data.id);
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        },
        onError: () => sonner_1.toast.error('Không mở được hội thoại'),
    });
    (0, react_1.useEffect)(() => {
        if (!peerFromUrl) {
            lastOpenedPeerRef.current = null;
            return;
        }
        if (lastOpenedPeerRef.current === peerFromUrl)
            return;
        lastOpenedPeerRef.current = peerFromUrl;
        openPeer.mutate(peerFromUrl);
    }, [peerFromUrl]);
    const messagesQ = (0, react_query_1.useQuery)({
        queryKey: activeThreadId ? messaging_query_keys_1.messagingQueryKeys.messages(activeThreadId) : ['messaging', 'messages', 'none'],
        queryFn: () => (0, messaging_api_1.listMessages)(activeThreadId, 1),
        enabled: !!activeThreadId,
        refetchInterval: 120_000,
    });
    const shareableQ = (0, react_query_1.useQuery)({
        queryKey: ['messaging', 'shareable-courses'],
        queryFn: messaging_api_1.listShareableCourses,
        enabled: !!activeThreadId,
        staleTime: 60_000,
    });
    const filteredShareable = (0, react_1.useMemo)(() => {
        const items = shareableQ.data?.items ?? [];
        const q = shareFilter.trim().toLowerCase();
        if (!q)
            return items;
        return items.filter((c) => c.title.toLowerCase().includes(q));
    }, [shareableQ.data, shareFilter]);
    const messageCount = messagesQ.data?.items?.length ?? 0;
    (0, react_1.useEffect)(() => {
        if (!activeThreadId || !messagesQ.isSuccess)
            return;
        qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
    }, [activeThreadId, messagesQ.isSuccess, messageCount, qc]);
    const sendMut = (0, react_query_1.useMutation)({
        mutationFn: () => {
            const body = draft.trim();
            const share = shareCourseId.trim();
            return (0, messaging_api_1.sendMessage)(activeThreadId, {
                ...(body ? { body } : {}),
                ...(share ? { shareCourseId: share } : {}),
            });
        },
        onSuccess: () => {
            setDraft('');
            setShareCourseId('');
            setShareCourseLabel('');
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.messages(activeThreadId) });
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        },
        onError: () => sonner_1.toast.error('Gửi không thành công'),
    });
    const onPickImage = async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f || !activeThreadId)
            return;
        try {
            const { url } = await uploadMedia(f, 'general');
            await (0, messaging_api_1.sendMessage)(activeThreadId, { imageUrls: [url] });
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.messages(activeThreadId) });
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        }
        catch {
        }
    };
    const threads = threadsQ.data ?? [];
    const activeThread = (0, react_1.useMemo)(() => threads.find((t) => t.id === activeThreadId) ?? null, [threads, activeThreadId]);
    const messages = messagesQ.data?.items ?? [];
    (0, react_1.useEffect)(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, activeThreadId]);
    const mePrefix = basePath.startsWith('/teacher') ? routes_1.ROUTES.TEACHER : routes_1.ROUTES.STUDENT;
    return (<div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4 h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tin nhắn</h1>
        <button_1.Button variant="outline" size="sm" asChild>
          <link_1.default href={mePrefix.DASHBOARD}>Về trang chủ</link_1.default>
        </button_1.Button>
      </div>
      <div className="flex flex-1 gap-4 min-h-0">
        <card_1.Card className="w-full max-w-xs shrink-0 overflow-y-auto p-2 space-y-1">
          {threadsQ.isLoading ? (<lucide_react_1.Loader2 className="w-6 h-6 animate-spin m-4"/>) : threads.length === 0 ? (<p className="text-sm text-muted-foreground p-3">Chưa có hội thoại.</p>) : (threads.map((t) => (<button key={t.id} type="button" onClick={() => setActiveThreadId(t.id)} className={(0, utils_1.cn)('w-full text-left rounded-lg px-3 py-2 text-sm transition', activeThreadId === t.id ? 'bg-primary/15 font-medium' : 'hover:bg-muted')}>
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{t.peer.fullName}</div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {(0, direct_message_policy_1.peerRoleLabel)(t.peer.role)}
                    </div>
                  </div>
                  {t.unread ? (<span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc"/>) : null}
                </div>
              </button>)))}
        </card_1.Card>
        <card_1.Card className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {!activeThreadId ? (<div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-6">
              Chọn một cuộc trò chuyện, mở từ cộng đồng (hồ sơ thành viên), hoặc từ trang khóa học.
            </div>) : (<>
              <div className="border-b px-4 py-3 font-semibold shrink-0">
                {activeThread?.peer.fullName || 'Đang tải…'}
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
                {messagesQ.isLoading ? (<lucide_react_1.Loader2 className="w-6 h-6 animate-spin"/>) : (messages.map((m) => <MessageBubble_1.MessageBubble key={m.id} m={m}/>))}
                <div ref={bottomRef}/>
              </div>
              <div className="border-t p-3 space-y-2 shrink-0 bg-card">
                <div className="flex flex-wrap items-center gap-2">
                  <popover_1.Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                    <popover_1.PopoverTrigger asChild>
                      <button_1.Button type="button" variant="outline" size="sm" className="text-xs h-8">
                        Chọn khóa học
                      </button_1.Button>
                    </popover_1.PopoverTrigger>
                    <popover_1.PopoverContent className="w-80 p-2" align="start">
                      <input_1.Input placeholder="Tìm theo tên..." value={shareFilter} onChange={(e) => setShareFilter(e.target.value)} className="mb-2 h-8 text-xs"/>
                      <div className="max-h-52 overflow-y-auto space-y-1">
                        {shareableQ.isLoading ? (<lucide_react_1.Loader2 className="w-5 h-5 animate-spin m-2 text-muted-foreground"/>) : null}
                        {filteredShareable.map((c) => (<button key={c.id} type="button" className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted" onClick={() => {
                    setShareCourseId(c.id);
                    setShareCourseLabel(c.title);
                    setSharePopoverOpen(false);
                    setShareFilter('');
                }}>
                            <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-muted">
                              {c.coverUrl ? (<image_1.default src={c.coverUrl} alt="" fill className="object-cover" unoptimized/>) : null}
                            </span>
                            <span className="line-clamp-2 min-w-0 flex-1">{c.title}</span>
                          </button>))}
                        {!shareableQ.isLoading && filteredShareable.length === 0 ? (<p className="p-2 text-xs text-muted-foreground">
                            Không có khóa học để chia sẻ (GV: khóa đã xuất bản; HV: khóa đang học).
                          </p>) : null}
                      </div>
                    </popover_1.PopoverContent>
                  </popover_1.Popover>
                  {shareCourseId ? (<div className="flex min-w-0 max-w-full items-center gap-2 text-xs">
                      <span className="truncate rounded-full bg-primary/10 px-2 py-1">
                        Gửi kèm: {shareCourseLabel || shareCourseId}
                      </span>
                      <button_1.Button type="button" variant="ghost" size="sm" className="h-7 shrink-0 px-2" onClick={() => {
                    setShareCourseId('');
                    setShareCourseLabel('');
                }}>
                        Bỏ
                      </button_1.Button>
                    </div>) : null}
                </div>
                <div className="flex gap-2 items-end">
                  <label className="shrink-0 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} disabled={isUploading}/>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background hover:bg-muted">
                      {isUploading ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/> : <lucide_react_1.ImagePlus className="w-4 h-4"/>}
                    </span>
                  </label>
                  <input_1.Input placeholder="Nhập tin nhắn..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (draft.trim() || shareCourseId.trim())
                        sendMut.mutate();
                }
            }} className="flex-1"/>
                  <button_1.Button type="button" size="icon" disabled={sendMut.isPending || (!draft.trim() && !shareCourseId.trim())} onClick={() => sendMut.mutate()}>
                    <lucide_react_1.Send className="w-4 h-4"/>
                  </button_1.Button>
                </div>
              </div>
            </>)}
        </card_1.Card>
      </div>
    </div>);
}
//# sourceMappingURL=MessagesScreen.js.map