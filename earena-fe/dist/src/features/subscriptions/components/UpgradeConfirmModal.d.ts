import { IPricingPlan } from '../types/subscription.schema';
interface UpgradeConfirmModalProps {
    plan: IPricingPlan | null;
    onClose: () => void;
}
export declare function UpgradeConfirmModal({ plan, onClose }: UpgradeConfirmModalProps): any;
export {};
