'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, Plus, Minus } from 'lucide-react';

export default function LandingPageClient() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [job, setJob] = useState('');
    const [mbti, setMbti] = useState('');
    const [targetParticipants, setTargetParticipants] = useState(2);
    const [loading, setLoading] = useState(false);

    const createChannel = async () => {
        if (!name) return;
        setLoading(true);
        try {
            const hostId = Math.random().toString(36).substring(2, 9);
            const res = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetParticipants,
                    hostInfo: { name, job, mbti, id: hostId }
                })
            });
            const data = await res.json();
            // Store host ID to recognize 'me' later
            localStorage.setItem(`selfer_${data.code}`, hostId);
            router.push(`/host/${data.code}`);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

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
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-[#1B4332] rounded-[22px] shadow-lg shadow-green-900/20 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-[#F7F3E9] fill-[#F7F3E9]" />
                            </div>
                        </div>
                        <h1 className="toss-title">
                            현명하게 시작하세요
                        </h1>
                        <p className="toss-subtitle">
                            어색한 첫 만남을<br />AI가 추천하는 주제로 자연스럽게 바꾸세요.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {/* Create Channel Area */}
                        <div className="toss-card p-6 space-y-6">
                            <div className="space-y-4 text-left">
                                <div>
                                    <label className="toss-label">호스트 이름 (필수)</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="이름을 입력하세요"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="toss-input"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="toss-label">직업</label>
                                        <input
                                            type="text"
                                            placeholder="직업"
                                            value={job}
                                            onChange={(e) => setJob(e.target.value)}
                                            className="toss-input"
                                        />
                                    </div>
                                    <div>
                                        <label className="toss-label">MBTI</label>
                                        <input
                                            type="text"
                                            maxLength={4}
                                            placeholder="MBTI"
                                            value={mbti}
                                            onChange={(e) => setMbti(e.target.value.toUpperCase())}
                                            className="toss-input"
                                        />
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
                                disabled={loading || !name}
                                onClick={createChannel}
                                className="toss-btn-primary w-full"
                            >
                                {loading ? '채널 생성 중...' : '새로운 채널 만들기'}
                            </button>
                        </div>

                        {/* Join Channel Area */}
                        <div className="toss-card p-6 space-y-4">
                            <label className="text-sm font-bold text-[var(--text-sub)] block text-left ml-1">코드로 참여하기</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="6자리 코드 입력"
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
                    </div>

                    <p className="text-[var(--text-light)] text-sm pt-20">
                        © 2026 Selfer. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
