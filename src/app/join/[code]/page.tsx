export const runtime = 'edge';
import JoinPageClient from './JoinPageClient';

export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
    return <JoinPageClient params={params} />;
}
