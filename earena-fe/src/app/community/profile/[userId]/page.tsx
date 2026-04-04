import { CommunityProfileScreen } from '@/features/community/screens/CommunityProfileScreen';

type Props = { params: Promise<{ userId: string }> };

export default async function CommunityProfilePage({ params }: Props) {
  const { userId } = await params;
  return <CommunityProfileScreen userId={userId} />;
}
