import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
export interface StandardResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    meta?: any;
}
export declare class TransformInterceptor<T> implements NestInterceptor<T, StandardResponse<T> | any> {
    private readonly reflector;
    constructor(reflector: Reflector);
    intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T> | any>;
}
