export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { store, Participant } from '@/lib/store';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;
    const body = await req.json();
    const { name, job, mbti, id } = body;

    if (!name) {
        return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const participant: Participant = {
        id: id || Math.random().toString(36).substring(2, 9),
        name,
        job,
        mbti
    };

    const success = await store.addParticipant(code, participant);
    if (!success) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, participant });
}
