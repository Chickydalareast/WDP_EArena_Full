import { CommunityPostScreen } from '@/features/community/screens/CommunityPostScreen';

type Props = { params: Promise<{ postId: string }> };

export default async function CommunityPostPage({ params }: Props) {
  const { postId } = await params;
  return <CommunityPostScreen postId={postId} />;
}
