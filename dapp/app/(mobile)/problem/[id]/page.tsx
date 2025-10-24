import { ProblemDetail } from '@/components/page/ProblemDetail';

interface ProblemDetailPageProps {
  params: Promise<{ id: string }>;
}

// Required for static export with dynamic routes
export async function generateStaticParams() {
  // For static export, we need to provide at least one path
  // Since this is a dynamic bounty app, we'll provide a placeholder
  // All other routes will be handled client-side
  return [
    { id: '1' }
  ];
}

export default async function ProblemDetailPage({
  params,
}: ProblemDetailPageProps) {
  const { id } = await params;
  return <ProblemDetail bountyId={id} />;
}
