import { ProblemDetail } from '@/components/page/ProblemDetail';

export const dynamic = 'force-static';

export default function ProblemsDetailPage({ searchParams }: any) {
  const id = searchParams.id;

  if (!id) {
    return <p>❗ 문제 ID가 없습니다.</p>;
  }

  return <ProblemDetail bountyId={id} />;
}
