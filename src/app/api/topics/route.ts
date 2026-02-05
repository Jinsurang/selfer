import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(req: NextRequest) {
    const { code } = await req.json();
    const channel = await store.getChannel(code);

    if (!channel) {
        return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
    }

    if (channel.participants.length < 1) {
        return NextResponse.json({ error: 'At least one participant is required' }, { status: 400 });
    }

    const participantInfo = channel.participants
        .map(p => `- Name: ${p.name}, Job: ${p.job || 'Unknown'}, MBTI: ${p.mbti || 'Unknown'}`)
        .join('\n');

    try {
        if (!process.env.ANTHROPIC_API_KEY) {
            throw new Error('API Key missing');
        }

        const response = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: `You are an icebreaking expert. Based on the following participant list, suggest 3-5 interesting conversation topics or questions that everyone can participate in. 
          Return ONLY the topics as a JSON array of strings. 
          
          Participants:
          ${participantInfo}`,
                },
            ],
        });

        // Simple parsing logic (assuming Claude returns JSON-like text)
        const text = response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : ['What is your favorite weekend activity?', 'What was your first impression of the group?', 'If you could have any superpower, what would it be?'];

        await store.setTopics(code, topics);
        return NextResponse.json({ topics });
    } catch (error) {
        console.error('AI Topic Generation Error:', error);
        // Fallback topics
        const fallbackTopics = [
            "최근에 가장 재미있게 본 영화나 드라마가 있나요?",
            "나만 아는 맛집이나 장소가 있을까요?",
            "다음에 기회가 된다면 꼭 가보고 싶은 여행지는 어디인가요?",
            "본인의 MBTI와 실제 성격이 얼마나 닮았다고 생각하시나요?",
            "인생의 터닝포인트가 되었던 사소한 경험이 있을까요?"
        ];
        await store.setTopics(code, fallbackTopics);
        return NextResponse.json({ topics: fallbackTopics, warning: 'Using fallback topics due to API error/missing key' });
    }
}
