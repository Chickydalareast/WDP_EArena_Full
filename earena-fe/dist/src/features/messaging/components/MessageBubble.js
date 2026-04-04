'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageBubble = MessageBubble;
const image_1 = __importDefault(require("next/image"));
const link_1 = __importDefault(require("next/link"));
const routes_1 = require("@/config/routes");
function MessageBubble({ m }) {
    return (<div className="rounded-lg border bg-card p-3 text-sm space-y-2 max-w-[95%]">
      {m.body ? <p className="whitespace-pre-wrap">{m.body}</p> : null}
      {m.imageUrls?.length ? (<div className="flex flex-wrap gap-2">
          {m.imageUrls.map((u) => (<a key={u} href={u} target="_blank" rel="noreferrer" className="relative block w-32 h-32 rounded-md overflow-hidden border">
              <image_1.default src={u} alt="" fill className="object-cover" unoptimized/>
            </a>))}
        </div>) : null}
      {m.shareCourse ? (<link_1.default href={routes_1.ROUTES.PUBLIC.COURSE_DETAIL(m.shareCourse.slug)} className="flex gap-3 rounded-md border border-primary/30 bg-primary/5 p-2 hover:bg-primary/10">
          <div className="relative w-16 h-16 shrink-0 rounded bg-muted overflow-hidden">
            {m.shareCourse.coverUrl ? (<image_1.default src={m.shareCourse.coverUrl} alt="" fill className="object-cover" unoptimized/>) : null}
          </div>
          <div>
            <div className="font-medium line-clamp-2">{m.shareCourse.title}</div>
            <span className="text-xs text-primary">Mở khóa học →</span>
          </div>
        </link_1.default>) : null}
      <div className="text-[10px] text-muted-foreground">
        {new Date(m.createdAt).toLocaleString('vi-VN')}
      </div>
    </div>);
}
//# sourceMappingURL=MessageBubble.js.map