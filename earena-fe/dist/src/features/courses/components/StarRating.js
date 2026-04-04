'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarRating = void 0;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const utils_1 = require("@/shared/lib/utils");
const StarRating = ({ value, onChange, readonly = false, size = 16, className }) => {
    const [hoverValue, setHoverValue] = (0, react_1.useState)(null);
    return (<div className={(0, utils_1.cn)("flex items-center gap-1", className)}>
            {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverValue ?? value) >= star;
            return (<lucide_react_1.Star key={star} size={size} className={(0, utils_1.cn)("transition-all duration-200", isFilled ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted-foreground/30", !readonly && "cursor-pointer hover:scale-110")} onMouseEnter={() => !readonly && setHoverValue(star)} onMouseLeave={() => !readonly && setHoverValue(null)} onClick={() => !readonly && onChange?.(star)}/>);
        })}
        </div>);
};
exports.StarRating = StarRating;
//# sourceMappingURL=StarRating.js.map