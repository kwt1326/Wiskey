import { ProblemDetail } from '@/components/page/ProblemDetail';

export const dynamic = 'force-static'; // 완전 정적 빌드 허용

interface ProblemsDetailPageProps {
  searchParams: { id?: string };
}

export default function ProblemsDetailPage({ searchParams }: ProblemsDetailPageProps) {
  const id = searchParams.id;

  if (!id) {
    return <p>❗ 문제 ID가 없습니다.</p>;
  }

  return <ProblemDetail bountyId={id} />;
}
