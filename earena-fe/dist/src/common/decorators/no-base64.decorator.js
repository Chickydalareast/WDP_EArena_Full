"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoBase64Constraint = void 0;
exports.NoBase64Image = NoBase64Image;
const class_validator_1 = require("class-validator");
let NoBase64Constraint = class NoBase64Constraint {
    validate(text) {
        if (!text)
            return true;
        const base64ImgRegex = /<img[^>]+src=["']data:image\/[^;]+;base64[^"']+["'][^>]*>/i;
        return !base64ImgRegex.test(text);
    }
    defaultMessage() {
        return 'Nội dung chứa ảnh Base64. Bắt buộc phải upload qua API Media và sử dụng link URL (Cloudinary).';
    }
};
exports.NoBase64Constraint = NoBase64Constraint;
exports.NoBase64Constraint = NoBase64Constraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ async: false })
], NoBase64Constraint);
function NoBase64Image(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: NoBase64Constraint,
        });
    };
}
//# sourceMappingURL=no-base64.decorator.js.map