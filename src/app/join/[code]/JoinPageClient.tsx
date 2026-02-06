'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, MessageCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Channel } from '@/lib/store';

const MBTIs = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
];

export default function JoinPageClient({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const router = useRouter();

    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [mbti, setMbti] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [joined, setJoined] = useState(false);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const INTEREST_OPTIONS = [
        { label: '연애/결혼', emoji: '❤️' },
        { label: '경제/사업', emoji: '💰' },
        { label: '시험/자격증', emoji: '📚' },
        { label: '패션/쇼핑', emoji: '🛍️' },
        { label: '운동/건강', emoji: '💪' },
        { label: '여행/캠핑', emoji: '🏕️' },
        { label: '미식/카페', emoji: '☕' },
        { label: '반려동물', emoji: '🐶' },
        { label: 'AI/IT', emoji: '🤖' },
    ];

    const isJoinValid = name && mbti && selectedInterests.length > 0;

    const fetchChannel = async () => {
        try {
            const res = await fetch(`/api/channels?code=${code}`);
            const data = await res.json();
            if (res.ok) {
                setChannel(data);
            } else {
                setError('존재하지 않는 채널 코드입니다.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchChannel();
        const interval = setInterval(() => {
            if (joined) fetchChannel();
        }, 3000);
        return () => clearInterval(interval);
    }, [code, joined]);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isJoinValid) return;

        setLoading(true);
        try {
            const id = localStorage.getItem(`selfer_${code}`) || Math.random().toString(36).substring(2, 9);
            const res = await fetch(`/api/channels/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    age: age === '' ? undefined : Number(age),
                    mbti,
                    interests: selectedInterests,
                    id
                }),
            });
            if (res.ok) {
                localStorage.setItem(`selfer_${code}`, id);
                setJoined(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6 bg-[var(--background)]">
            <div className="toss-card p-10 space-y-4">
                <p className="text-red-500 font-bold">{error}</p>
                <button onClick={() => router.push('/')} className="toss-btn-ghost w-full">홈으로 돌아가기</button>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen bg-[var(--background)] flex flex-col items-center p-6">
            <AnimatePresence mode="wait">
                {!joined ? (
                    <motion.div
                        key="join-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md space-y-8 pt-10"
                    >
                        <div className="text-center space-y-3">
                            <h1 className="toss-title">만나서 반가워요!</h1>
                            <p className="toss-subtitle">
                                채널 <span className="text-[var(--accent)] font-black">{code}</span> 정보 입력을 위해<br />프로필을 작성해 주세요.
                            </p>
                        </div>

                        <form onSubmit={handleJoin} className="toss-card p-8 space-y-8">
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="toss-label text-left block">이름 (필수)</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="이름"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="toss-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="toss-label text-left block">나이 (선택)</label>
                                        <input
                                            type="number"
                                            placeholder="나이"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="toss-input"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="toss-label text-left block">MBTI (필수)</label>
                                    <select
                                        required
                                        value={mbti}
                                        onChange={(e) => setMbti(e.target.value)}
                                        className="toss-input appearance-none bg-white cursor-pointer"
                                    >
                                        <option value="" disabled>MBTI 선택</option>
                                        {MBTIs.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="toss-label text-left block">주요 관심사 (필수 / 중복 가능)</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {INTEREST_OPTIONS.map((opt) => {
                                            const isSelected = selectedInterests.includes(opt.label);
                                            return (
                                                <button
                                                    key={opt.label}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedInterests(selectedInterests.filter(i => i !== opt.label));
                                                        } else {
                                                            setSelectedInterests([...selectedInterests, opt.label]);
                                                        }
                                                    }}
                                                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${isSelected
                                                        ? 'border-[var(--accent)] bg-[#1B4332]/5 shadow-sm'
                                                        : 'border-[var(--border)] bg-gray-50/50 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{opt.emoji}</span>
                                                    <span className={`text-[11px] font-bold ${isSelected ? 'text-[var(--accent)]' : 'text-[var(--text-light)]'}`}>{opt.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isJoinValid}
                                className="toss-btn-primary w-full py-5 text-lg"
                            >
                                {loading ? '참여 중...' : '입장하기'}
                            </button>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="channel-view"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-lg space-y-8 pt-10 flex flex-col"
                    >
                        <div className="flex flex-col items-center text-center gap-4 mb-4">
                            <div className="toss-badge-blue px-4 py-2 text-sm font-black flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                입장 완료
                            </div>
                            <h1 className="toss-title">대화가 시작되면<br />여기에 주제가 나타나요</h1>
                        </div>

                        <div className="toss-card p-10 flex flex-col items-center justify-center min-h-[350px] text-center border-l-[8px] border-[var(--accent)]">
                            {channel?.topics && channel.topics.length > 0 ? (
                                <motion.div
                                    key={channel.currentTopicIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="w-16 h-16 bg-[#E8E2D2] rounded-3xl flex items-center justify-center mx-auto mb-4">
                                        <MessageCircle className="w-8 h-8 text-[var(--accent)]" />
                                    </div>
                                    <p className="text-sm font-black text-[var(--accent)] uppercase tracking-[0.2em]">Current Question</p>
                                    <h2 className="text-3xl md:text-4xl font-black leading-snug text-[var(--text-main)] tracking-tighter">
                                        "{channel.topics[channel.currentTopicIndex]}"
                                    </h2>
                                </motion.div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#1B4332]/5 blur-3xl rounded-full" />
                                        <div className="relative w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto animate-pulse border border-[var(--border)]">
                                            <MessageCircle className="w-10 h-10 text-[var(--text-light)]" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-black text-[var(--text-main)]">주제를 생성하고 있어요</p>
                                        <p className="text-[var(--text-light)] font-bold">호스트가 대화를 시작하길 기다려주세요.</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-10 space-y-4">
                            <p className="text-center text-xs font-black text-[var(--text-light)] uppercase tracking-widest">Together with</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {channel?.participants.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        title={p.name}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-10 h-10 rounded-full bg-white border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--text-main)] text-xs font-black"
                                    >
                                        {p.name[0]}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
