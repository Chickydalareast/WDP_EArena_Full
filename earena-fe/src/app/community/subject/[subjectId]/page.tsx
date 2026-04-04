import { CommunityFeedScreen } from '@/features/community/screens/CommunityFeedScreen';

type Props = { params: Promise<{ subjectId: string }> };

export default async function CommunitySubjectPage({ params }: Props) {
  const { subjectId } = await params;
  return <CommunityFeedScreen lockedSubjectId={subjectId} />;
}
