"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const bullmq_1 = require("@nestjs/bullmq");
const classes_processor_1 = require("./classes.processor");
const class_schema_1 = require("./schemas/class.schema");
const class_member_schema_1 = require("./schemas/class-member.schema");
const classes_repository_1 = require("./classes.repository");
const class_members_repository_1 = require("./class-members.repository");
const classes_controller_1 = require("./classes.controller");
const classes_service_1 = require("./classes.service");
let ClassesModule = class ClassesModule {
};
exports.ClassesModule = ClassesModule;
exports.ClassesModule = ClassesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({
                name: 'classes_queue',
            }),
            mongoose_1.MongooseModule.forFeature([
                { name: class_schema_1.Class.name, schema: class_schema_1.ClassSchema },
                { name: class_member_schema_1.ClassMember.name, schema: class_member_schema_1.ClassMemberSchema },
            ]),
        ],
        controllers: [classes_controller_1.ClassesController],
        providers: [
            classes_repository_1.ClassesRepository,
            class_members_repository_1.ClassMembersRepository,
            classes_service_1.ClassesService,
            classes_processor_1.ClassesProcessor
        ],
        exports: [
            classes_repository_1.ClassesRepository,
            class_members_repository_1.ClassMembersRepository,
            classes_service_1.ClassesService
        ],
    })
], ClassesModule);
//# sourceMappingURL=classes.module.js.map