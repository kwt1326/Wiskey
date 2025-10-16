import { ProblemDetail } from '@/components/page/ProblemDetail';

interface ProblemDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  const { id } = await params;
  return <ProblemDetail bountyId={id} />;
}
