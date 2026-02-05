export const runtime = 'edge';
import HostDashboardClient from './HostDashboardClient';

export default function HostDashboardPage({ params }: { params: Promise<{ code: string }> }) {
    return <HostDashboardClient params={params} />;
}
