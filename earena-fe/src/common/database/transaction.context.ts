import { AsyncLocalStorage } from 'async_hooks';
import { ClientSession } from 'mongoose';


export const transactionContext = new AsyncLocalStorage<ClientSession>();