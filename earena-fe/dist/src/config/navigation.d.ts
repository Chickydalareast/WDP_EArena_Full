import type { ElementType } from 'react';
export type NavItem = {
    title: string;
    href: string;
    icon: ElementType;
};
export declare const NAV_CONFIG: Record<'STUDENT' | 'TEACHER' | 'ADMIN', NavItem[]>;
