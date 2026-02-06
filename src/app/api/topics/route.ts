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
        .map(p => `- Name: ${p.name}, Age: ${p.age || 'N/A'}, MBTI: ${p.mbti}, Interests: ${p.interests.join(', ')}`)
        .join('\n');

    // Move fallbackTopics definition up
    const fallbackTopics = [
        "최근에 가장 재미있게 본 영화나 드라마가 있나요?",
        "나만 아는 맛집이나 장소가 있을까요?",
        "다음에 기회가 된다면 꼭 가보고 싶은 여행지는 어디인가요?",
        "본인의 MBTI와 실제 성격이 얼마나 닮았다고 생각하시나요?",
        "인생의 터닝포인트가 되었던 사소한 경험이 있을까요?"
    ];

    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY missing');
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        const prompt = `당신은 세계 최고의 아이스브레이킹 및 심리 전문가입니다. 
아래 참가자들의 상세 프로필(이름, 나이, MBTI, 관심사)을 분석하여, 이들이 서로의 '새로운 면모'를 발견하고 깊이 있게 연결될 수 있는 질문 5개를 생성하세요.

[참가자 데이터]
${participantInfo}

[알고리즘 가이드라인]
1. **다양성 (Diversity)**: 다음 5가지 카테고리에서 하나씩 질문을 뽑으세요.
   - (1) 공통점 기반: 참가자들의 공통된 관심사나 성향에서 출발하는 질문
   - (2) 의외성 발견: 겉보기와는 다른 반전 매력을 끌어낼 수 있는 질문
   - (3) 가치관 탐색: 인생에서 중요하게 생각하는 가치나 철학에 대한 질문
   - (4) 가벼운 취향: 최근의 사소하지만 즐거운 일상에 대한 질문
   - (5) IF/상상력: 특정 상황을 가정하고 서로의 반응을 예측해보는 재미있는 질문
2. **개인화 (Personalization)**: 질문 안에 최소 1명 이상의 이름이나 관심사 키워드를 직접 언급하여 '우리만을 위한 질문'이라는 느낌을 주세요.
3. **톤앤매너**: 따뜻하고, 호기심 넘치며, 세련되게 질문하세요. "어떤 것을 좋아하세요?" 같은 뻔한 질문은 배제합니다.
4. **언어**: 반드시 한국어로 답변하세요.

Return ONLY the topics as a JSON array of strings. Do not include markdown formatting or 'json' tags. 
Example format: ["질문1", "질문2", "질문3", "질문4", "질문5"]`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        const cleanedText = text.replace(/```json|```/g, '').trim();
        const jsonMatch = cleanedText.match(/\[[\s\S]*\]/);
        const topics = jsonMatch ? JSON.parse(jsonMatch[0]) : fallbackTopics;

        await store.setTopics(code, topics);
        return NextResponse.json({ topics });
    } catch (error) {
        console.error('Gemini AI Topic Generation Error:', error);
        await store.setTopics(code, fallbackTopics);
        return NextResponse.json({ topics: fallbackTopics, warning: 'Using fallback topics due to AI error/missing key' });
    }
}
