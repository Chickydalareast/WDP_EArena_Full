import { WithdrawalRequest } from '../types/admin-wallet.schema';
interface ProcessWithdrawalModalProps {
    request: WithdrawalRequest | null;
    onClose: () => void;
}
export declare function ProcessWithdrawalModal({ request, onClose }: ProcessWithdrawalModalProps): any;
export {};
