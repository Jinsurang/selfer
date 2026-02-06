export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const { targetParticipants, hostInfo } = body;
    const channel = await store.createChannel(targetParticipants, hostInfo);
    return NextResponse.json(channel);
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    if (!code) {
        return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const channel = await store.getChannel(code);
    if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json(channel);
}

export async function PATCH(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const action = searchParams.get('action');

    if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 });

    if (action === 'next') {
        const success = await store.nextTopic(code);
        return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
