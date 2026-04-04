import { IJwtPayload } from '../interfaces/jwt-payload.interface';
export declare const CurrentUser: (...dataOrPipes: (keyof IJwtPayload | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | undefined)[]) => ParameterDecorator;
