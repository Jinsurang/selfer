'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight, Plus, Minus } from 'lucide-react';

export default function LandingPageClient() {
    const router = useRouter();
    const [view, setView] = useState<'selection' | 'create' | 'join'>('selection');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState<number | ''>('');
    const [mbti, setMbti] = useState('');
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [targetParticipants, setTargetParticipants] = useState(2);
    const [loading, setLoading] = useState(false);

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

    const MBTI_OPTIONS = [
        'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
        'ISTP', 'ISFP', 'INFP', 'INTP',
        'ESTP', 'ESFP', 'ENFP', 'ENTP',
        'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
    ];

    const createChannel = async () => {
        if (!name || !mbti || selectedInterests.length === 0) return;
        setLoading(true);
        try {
            const hostId = Math.random().toString(36).substring(2, 9);
            const res = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetParticipants,
                    hostInfo: {
                        name,
                        age: age === '' ? undefined : Number(age),
                        mbti,
                        interests: selectedInterests,
                        id: hostId
                    }
                })
            });
            const data = await res.json();
            localStorage.setItem(`selfer_${data.code}`, hostId);
            router.push(`/host/${data.code}`);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const isCreateValid = name && mbti && selectedInterests.length > 0;

    const joinChannel = () => {
        if (code.length === 6) {
            router.push(`/join/${code.toUpperCase()}`);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-[var(--background)]">
            <div className="w-full max-w-md px-6 py-20 flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-center space-y-12"
                >
                    <div className="space-y-4">
                        <div className="flex justify-center mb-10">
                            <motion.img
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src="/selfer_logo.png"
                                alt="Selfer"
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                        <p className="toss-subtitle">
                            맞춤형 대화를 통해<br />또 다른 나를 발견하는 시간
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {view === 'selection' ? (
                            <motion.div
                                key="selection"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-4"
                            >
                                <button
                                    onClick={() => setView('create')}
                                    className="toss-card w-full p-8 flex items-center justify-between group transition-all hover:translate-y-[-2px] hover:shadow-lg active:scale-95 text-left"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-[var(--accent)]">새로운 질문방 만들기</h3>
                                        <p className="text-sm text-[var(--text-sub)]">호스트로서 대화를 시작합니다</p>
                                    </div>
                                    <Plus className="w-6 h-6 text-[var(--text-light)] group-hover:text-[var(--accent)] transition-colors" />
                                </button>

                                <button
                                    onClick={() => setView('join')}
                                    className="toss-card w-full p-8 flex items-center justify-between group transition-all hover:translate-y-[-2px] hover:shadow-lg active:scale-95 text-left"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-[var(--text-main)]">코드로 참여하기</h3>
                                        <p className="text-sm text-[var(--text-sub)]">공유받은 코드로 입장합니다</p>
                                    </div>
                                    <ChevronRight className="w-6 h-6 text-[var(--text-light)] group-hover:text-[var(--text-main)] transition-colors" />
                                </button>
                            </motion.div>
                        ) : view === 'create' ? (
                            <motion.div
                                key="create"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="toss-card p-6 space-y-6">
                                    <div className="space-y-4 text-left">
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
                                                {MBTI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
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

                                    <div className="flex items-center justify-between border-t border-[var(--border)] pt-6">
                                        <span className="text-sm font-bold text-[var(--text-sub)]">참여 목표 인원</span>
                                        <div className="flex items-center gap-4 bg-[var(--background)] px-3 py-2 rounded-xl">
                                            <button
                                                onClick={() => setTargetParticipants(Math.max(1, targetParticipants - 1))}
                                                className="w-8 h-8 flex items-center justify-center text-[var(--accent)] hover:bg-white rounded-lg transition-all"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <span className="font-black text-[var(--text-main)] w-4 text-center">{targetParticipants}</span>
                                            <button
                                                onClick={() => setTargetParticipants(targetParticipants + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-[var(--accent)] hover:bg-white rounded-lg transition-all"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        disabled={loading || !isCreateValid}
                                        onClick={createChannel}
                                        className="toss-btn-primary w-full"
                                    >
                                        {loading ? '채널 생성 중...' : '방 만들기'}
                                    </button>
                                </div>
                                <button onClick={() => setView('selection')} className="text-sm font-bold text-[var(--text-light)] hover:text-[var(--text-sub)] transition-colors">
                                    뒤로 가기
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="join"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="toss-card p-6 space-y-4 text-left">
                                    <label className="toss-label block ml-1 text-[var(--text-main)]">6자리 코드 입력</label>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            placeholder="XXXXXX"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                                            className="toss-input flex-1 font-mono tracking-widest text-center"
                                        />
                                        <button
                                            onClick={joinChannel}
                                            disabled={code.length !== 6}
                                            className="toss-btn-secondary px-5"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                <button onClick={() => setView('selection')} className="text-sm font-bold text-[var(--text-light)] hover:text-[var(--text-sub)] transition-colors">
                                    뒤로 가기
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="text-[var(--text-light)] text-sm pt-20">
                        © 2026 Selfer. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
