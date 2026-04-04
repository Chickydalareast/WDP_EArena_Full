'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCommunityFloatingChatOptional = useCommunityFloatingChatOptional;
exports.CommunityFloatingChatShell = CommunityFloatingChatShell;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const image_1 = __importDefault(require("next/image"));
const react_query_1 = require("@tanstack/react-query");
const auth_store_1 = require("@/features/auth/stores/auth.store");
const routes_1 = require("@/config/routes");
const messaging_api_1 = require("@/features/messaging/api/messaging-api");
const MessageBubble_1 = require("@/features/messaging/components/MessageBubble");
const messaging_query_keys_1 = require("@/features/messaging/lib/messaging-query-keys");
const useMessagingUnreadCount_1 = require("@/features/messaging/hooks/useMessagingUnreadCount");
const direct_message_policy_1 = require("@/features/messaging/lib/direct-message-policy");
const button_1 = require("@/shared/components/ui/button");
const input_1 = require("@/shared/components/ui/input");
const card_1 = require("@/shared/components/ui/card");
const popover_1 = require("@/shared/components/ui/popover");
const useMediaUpload_1 = require("@/shared/hooks/useMediaUpload");
const lucide_react_1 = require("lucide-react");
const sonner_1 = require("sonner");
const utils_1 = require("@/shared/lib/utils");
const CommunityFloatingChatContext = (0, react_1.createContext)(null);
function useCommunityFloatingChatOptional() {
    return (0, react_1.useContext)(CommunityFloatingChatContext);
}
function CommunityFloatingChatShell({ children }) {
    const user = (0, auth_store_1.useAuthStore)((s) => s.user);
    const isAuthenticated = (0, auth_store_1.useAuthStore)((s) => s.isAuthenticated);
    const qc = (0, react_query_1.useQueryClient)();
    const [peerUserId, setPeerUserId] = (0, react_1.useState)(null);
    const [peerDisplayName, setPeerDisplayName] = (0, react_1.useState)();
    const [threadId, setThreadId] = (0, react_1.useState)(null);
    const [expanded, setExpanded] = (0, react_1.useState)(true);
    const [draft, setDraft] = (0, react_1.useState)('');
    const [shareCourseId, setShareCourseId] = (0, react_1.useState)('');
    const [shareCourseLabel, setShareCourseLabel] = (0, react_1.useState)('');
    const [sharePopoverOpen, setSharePopoverOpen] = (0, react_1.useState)(false);
    const [shareFilter, setShareFilter] = (0, react_1.useState)('');
    const bottomRef = (0, react_1.useRef)(null);
    const { uploadMedia, isUploading } = (0, useMediaUpload_1.useMediaUpload)();
    const sessionActive = !!peerUserId && !!threadId;
    const threadsQ = (0, react_query_1.useQuery)({
        queryKey: messaging_query_keys_1.messagingQueryKeys.threads,
        queryFn: messaging_api_1.listThreads,
        enabled: isAuthenticated && sessionActive,
        staleTime: 30_000,
    });
    const openPeerMut = (0, react_query_1.useMutation)({
        mutationFn: (pid) => (0, messaging_api_1.openThread)(pid),
        onSuccess: (data) => {
            setThreadId(data.id);
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        },
        onError: () => {
            sonner_1.toast.error('Không mở được hội thoại');
            setPeerUserId(null);
            setPeerDisplayName(undefined);
        },
    });
    const messagesQ = (0, react_query_1.useQuery)({
        queryKey: threadId ? messaging_query_keys_1.messagingQueryKeys.messages(threadId) : ['messaging', 'messages', 'none'],
        queryFn: () => (0, messaging_api_1.listMessages)(threadId, 1),
        enabled: !!threadId,
        refetchInterval: 120_000,
    });
    const shareableQ = (0, react_query_1.useQuery)({
        queryKey: ['messaging', 'shareable-courses'],
        queryFn: messaging_api_1.listShareableCourses,
        enabled: !!threadId,
        staleTime: 60_000,
    });
    const filteredShareable = (0, react_1.useMemo)(() => {
        const items = shareableQ.data?.items ?? [];
        const q = shareFilter.trim().toLowerCase();
        if (!q)
            return items;
        return items.filter((c) => c.title.toLowerCase().includes(q));
    }, [shareableQ.data, shareFilter]);
    const messages = messagesQ.data?.items ?? [];
    (0, react_1.useEffect)(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length, threadId]);
    const activeThread = (0, react_1.useMemo)(() => {
        const threads = threadsQ.data ?? [];
        return threads.find((t) => t.id === threadId) ?? null;
    }, [threadsQ.data, threadId]);
    const headerName = activeThread?.peer.fullName || peerDisplayName || 'Đang tải…';
    const sendMut = (0, react_query_1.useMutation)({
        mutationFn: () => {
            const body = draft.trim();
            const share = shareCourseId.trim();
            return (0, messaging_api_1.sendMessage)(threadId, {
                ...(body ? { body } : {}),
                ...(share ? { shareCourseId: share } : {}),
            });
        },
        onSuccess: () => {
            setDraft('');
            setShareCourseId('');
            setShareCourseLabel('');
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.messages(threadId) });
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        },
        onError: () => sonner_1.toast.error('Gửi không thành công'),
    });
    const onPickImage = async (e) => {
        const f = e.target.files?.[0];
        e.target.value = '';
        if (!f || !threadId)
            return;
        try {
            const { url } = await uploadMedia(f, 'general');
            await (0, messaging_api_1.sendMessage)(threadId, { imageUrls: [url] });
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.messages(threadId) });
            qc.invalidateQueries({ queryKey: messaging_query_keys_1.messagingQueryKeys.threads });
            qc.invalidateQueries({ queryKey: useMessagingUnreadCount_1.messagingUnreadQueryKey });
        }
        catch {
        }
    };
    const openWithPeer = (0, react_1.useCallback)((pid, name) => {
        if (!isAuthenticated) {
            sonner_1.toast.error('Vui lòng đăng nhập để nhắn tin');
            return;
        }
        setPeerUserId(pid);
        setPeerDisplayName(name);
        setThreadId(null);
        setExpanded(true);
        setDraft('');
        setShareCourseId('');
        setShareCourseLabel('');
        openPeerMut.mutate(pid);
    }, [isAuthenticated, openPeerMut]);
    const closeSession = (0, react_1.useCallback)(() => {
        setPeerUserId(null);
        setPeerDisplayName(undefined);
        setThreadId(null);
        setExpanded(true);
        setDraft('');
        setShareCourseId('');
        setShareCourseLabel('');
    }, []);
    const inboxBase = user?.role === 'TEACHER' ? routes_1.ROUTES.TEACHER.MESSAGES : routes_1.ROUTES.STUDENT.MESSAGES;
    const inboxHref = peerUserId && inboxBase
        ? `${inboxBase}?peer=${encodeURIComponent(peerUserId)}`
        : inboxBase;
    const ctx = (0, react_1.useMemo)(() => ({ openWithPeer }), [openWithPeer]);
    const showDock = isAuthenticated && (sessionActive || openPeerMut.isPending) && !!peerUserId;
    return (<CommunityFloatingChatContext.Provider value={ctx}>
      {children}

      {showDock ? (<div className="fixed z-[100] flex flex-col items-end gap-2 pointer-events-none [&>*]:pointer-events-auto" style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))' }}>
          {!expanded ? (<button_1.Button type="button" size="lg" className="h-14 w-14 rounded-full shadow-lg" onClick={() => setExpanded(true)} aria-label="Mở khung chat">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/15 text-lg font-bold">
                {headerName.charAt(0) || <lucide_react_1.MessageCircle className="h-6 w-6"/>}
              </span>
            </button_1.Button>) : (<card_1.Card className={(0, utils_1.cn)('flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden border-border/80 shadow-2xl', 'h-[min(72vh,520px)]')}>
              <div className="flex items-center gap-2 border-b bg-card px-3 py-2.5 shrink-0">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{headerName}</div>
                  {activeThread?.peer.role ? (<div className="truncate text-[10px] text-muted-foreground">
                      {(0, direct_message_policy_1.peerRoleLabel)(activeThread.peer.role)}
                    </div>) : null}
                </div>
                <button_1.Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setExpanded(false)} aria-label="Thu nhỏ">
                  <lucide_react_1.ChevronDown className="h-4 w-4"/>
                </button_1.Button>
                {inboxHref ? (<button_1.Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
                    <link_1.default href={inboxHref} aria-label="Mở hộp thư đầy đủ">
                      <lucide_react_1.ExternalLink className="h-4 w-4"/>
                    </link_1.default>
                  </button_1.Button>) : null}
                <button_1.Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={closeSession} aria-label="Đóng">
                  <lucide_react_1.X className="h-4 w-4"/>
                </button_1.Button>
              </div>

              <div className="flex min-h-0 flex-1 flex-col bg-muted/15">
                <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-2">
                  {openPeerMut.isPending || !threadId ? (<div className="flex justify-center py-12">
                      <lucide_react_1.Loader2 className="h-7 w-7 animate-spin text-muted-foreground"/>
                    </div>) : messagesQ.isLoading ? (<div className="flex justify-center py-12">
                      <lucide_react_1.Loader2 className="h-7 w-7 animate-spin text-muted-foreground"/>
                    </div>) : (messages.map((m) => <MessageBubble_1.MessageBubble key={m.id} m={m}/>))}
                  <div ref={bottomRef}/>
                </div>

                {threadId ? (<div className="shrink-0 space-y-2 border-t bg-card p-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <popover_1.Popover open={sharePopoverOpen} onOpenChange={setSharePopoverOpen}>
                        <popover_1.PopoverTrigger asChild>
                          <button_1.Button type="button" variant="outline" size="sm" className="h-7 text-[11px] px-2">
                            Chia sẻ khóa
                          </button_1.Button>
                        </popover_1.PopoverTrigger>
                        <popover_1.PopoverContent className="w-72 p-2" align="start">
                          <input_1.Input placeholder="Tìm khóa học..." value={shareFilter} onChange={(e) => setShareFilter(e.target.value)} className="mb-2 h-8 text-xs"/>
                          <div className="max-h-44 space-y-1 overflow-y-auto">
                            {shareableQ.isLoading ? (<lucide_react_1.Loader2 className="mx-auto my-2 h-5 w-5 animate-spin text-muted-foreground"/>) : null}
                            {filteredShareable.map((c) => (<button key={c.id} type="button" className="flex w-full gap-2 rounded-md px-2 py-1.5 text-left text-xs hover:bg-muted" onClick={() => {
                            setShareCourseId(c.id);
                            setShareCourseLabel(c.title);
                            setSharePopoverOpen(false);
                            setShareFilter('');
                        }}>
                                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded bg-muted">
                                  {c.coverUrl ? (<image_1.default src={c.coverUrl} alt="" fill className="object-cover" unoptimized/>) : null}
                                </span>
                                <span className="line-clamp-2 min-w-0 flex-1">{c.title}</span>
                              </button>))}
                            {!shareableQ.isLoading && filteredShareable.length === 0 ? (<p className="p-2 text-[11px] text-muted-foreground">Không có khóa để chia sẻ.</p>) : null}
                          </div>
                        </popover_1.PopoverContent>
                      </popover_1.Popover>
                      {shareCourseId ? (<span className="max-w-[200px] truncate rounded-full bg-primary/10 px-2 py-0.5 text-[10px]">
                          {shareCourseLabel || shareCourseId}
                          <button type="button" className="ml-1 text-primary underline" onClick={() => {
                            setShareCourseId('');
                            setShareCourseLabel('');
                        }}>
                            ×
                          </button>
                        </span>) : null}
                    </div>
                    <div className="flex gap-1.5 items-end">
                      <label className="shrink-0 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={onPickImage} disabled={isUploading}/>
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-muted">
                          {isUploading ? (<lucide_react_1.Loader2 className="h-3.5 w-3.5 animate-spin"/>) : (<lucide_react_1.ImagePlus className="h-3.5 w-3.5"/>)}
                        </span>
                      </label>
                      <input_1.Input placeholder="Nhập tin nhắn..." value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            if (draft.trim() || shareCourseId.trim())
                                sendMut.mutate();
                        }
                    }} className="h-9 flex-1 text-sm"/>
                      <button_1.Button type="button" size="icon" className="h-9 w-9 shrink-0" disabled={sendMut.isPending || (!draft.trim() && !shareCourseId.trim())} onClick={() => sendMut.mutate()}>
                        <lucide_react_1.Send className="h-4 w-4"/>
                      </button_1.Button>
                    </div>
                  </div>) : null}
              </div>
            </card_1.Card>)}
        </div>) : null}
    </CommunityFloatingChatContext.Provider>);
}
//# sourceMappingURL=CommunityFloatingChatShell.js.map