import { INotification } from '../types/notification.schema';
interface Props {
    data: INotification;
    closeDropdown: () => void;
}
export declare const NotificationItem: ({ data, closeDropdown }: Props) => any;
export {};
