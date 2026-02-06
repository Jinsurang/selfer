export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
        .map(p => `- Name: ${p.name}, MBTI: ${p.mbti}, Personality: ${p.personality}, Interests: ${p.interests}`)
        .join('\n');

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY missing');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an icebreaking expert. Based on the following participant list, suggest 3-5 interesting conversation topics or questions that everyone can participate in. 
        Return ONLY the topics as a JSON array of strings. Do not include any other text or markdown formatting.
        
        Participants:
        ${participantInfo}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Clean up text in case Gemini wraps it in code blocks
        const cleanedText = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : ['What is your favorite weekend activity?', 'What was your first impression of the group?', 'If you could have any superpower, what would it be?'];

        await store.setTopics(code, topics);
        return NextResponse.json({ topics });
    } catch (error) {
        console.error('Gemini AI Topic Generation Error:', error);
        // Fallback topics
        const fallbackTopics = [
            "최근에 가장 재미있게 본 영화나 드라마가 있나요?",
            "나만 아는 맛집이나 장소가 있을까요?",
            "다음에 기회가 된다면 꼭 가보고 싶은 여행지는 어디인가요?",
            "본인의 MBTI와 실제 성격이 얼마나 닮았다고 생각하시나요?",
            "인생의 터닝포인트가 되었던 사소한 경험이 있을까요?"
        ];
        await store.setTopics(code, fallbackTopics);
        return NextResponse.json({ topics: fallbackTopics, warning: 'Using fallback topics due to AI error/missing key' });
    }
}
