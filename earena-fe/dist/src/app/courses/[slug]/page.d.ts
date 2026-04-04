import { Metadata, ResolvingMetadata } from 'next';
type Props = {
    params: Promise<{
        slug: string;
    }>;
};
export declare function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata>;
export default function CourseDetailPage({ params }: Props): Promise<any>;
export {};
