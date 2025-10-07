import { ProblemDetail } from '@/components/ProblemDetail';

interface ProblemDetailPageProps {
  params: { id: string };
}

export default function ProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  return <ProblemDetail bountyId={params.id} />;
}
