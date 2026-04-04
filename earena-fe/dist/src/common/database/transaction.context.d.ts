import { AsyncLocalStorage } from 'async_hooks';
export declare const transactionContext: AsyncLocalStorage<import("mongodb").ClientSession>;
