"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const operators_1 = require("rxjs/operators");
const bypass_transform_decorator_1 = require("../decorators/bypass-transform.decorator");
let TransformInterceptor = class TransformInterceptor {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    intercept(context, next) {
        const bypassTransform = this.reflector.getAllAndOverride(bypass_transform_decorator_1.BYPASS_TRANSFORM_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (bypassTransform) {
            return next.handle();
        }
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        return next.handle().pipe((0, operators_1.map)((resData) => {
            if (resData === null || resData === undefined) {
                return { statusCode, message: 'Success', data: null };
            }
            const isPreFormattedResponse = typeof resData === 'object' &&
                !Array.isArray(resData) &&
                'data' in resData &&
                Object.keys(resData).every(key => ['data', 'meta', 'message'].includes(key));
            if (isPreFormattedResponse) {
                return {
                    statusCode,
                    message: resData.message || 'Success',
                    data: resData.data,
                    ...(resData.meta && { meta: resData.meta })
                };
            }
            return {
                statusCode,
                message: 'Success',
                data: resData,
            };
        }));
    }
};
exports.TransformInterceptor = TransformInterceptor;
exports.TransformInterceptor = TransformInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TransformInterceptor);
//# sourceMappingURL=transform.interceptor.js.map