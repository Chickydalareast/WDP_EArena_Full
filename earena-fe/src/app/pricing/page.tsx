import { Metadata } from 'next';
import { PublicPricingScreen } from '@/features/subscriptions/screens/PublicPricingScreen';

export const metadata: Metadata = {
    title: 'Bảng giá Gói cước Giáo viên | EArena',
    description: 'Khám phá các gói dịch vụ giúp giảng viên xây dựng và bán khóa học hiệu quả trên nền tảng EArena.',
};

export default function PricingPage() {
    return <PublicPricingScreen />;
}