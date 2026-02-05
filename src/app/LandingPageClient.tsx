'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, Users, ChevronRight, Plus, Minus } from 'lucide-react';

export default function LandingPageClient() {
    const router = useRouter();
    const [code, setCode] = useState('');
    const [targetParticipants, setTargetParticipants] = useState(2);
    const [loading, setLoading] = useState(false);

    const createChannel = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/channels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetParticipants })
            });
            const data = await res.json();
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
        <main className="flex min-h-screen flex-col items-center bg-[#f2f4f6]">
            <div className="w-full max-w-md px-6 py-20 flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full text-center space-y-12"
                >
                    <div className="space-y-4">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-[#3182f6] rounded-[22px] shadow-lg shadow-blue-500/20 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-white fill-white" />
                            </div>
                        </div>
                        <h1 className="toss-title">
                            현명하게 시작하세요
                        </h1>
                        <p className="toss-subtitle">
                            어색한 첫 만남을<br />AI가 추천하는 주제로 자연스럽게 바꾸세요.
                        </p>
                    </div>

                    <div className="space-y-4 pt-10">
                        {/* Create Channel Area */}
                        <div className="toss-card p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-[#4e5968]">참여 목표 인원</span>
                                <div className="flex items-center gap-4 bg-[#f9fafb] px-3 py-2 rounded-xl">
                                    <button
                                        onClick={() => setTargetParticipants(Math.max(1, targetParticipants - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-[#3182f6] hover:bg-white rounded-lg transition-all"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-black text-[#191f28] w-4 text-center">{targetParticipants}</span>
                                    <button
                                        onClick={() => setTargetParticipants(targetParticipants + 1)}
                                        className="w-8 h-8 flex items-center justify-center text-[#3182f6] hover:bg-white rounded-lg transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                onClick={createChannel}
                                className="toss-btn-primary w-full"
                            >
                                {loading ? '채널 생성 중...' : '새로운 채널 만들기'}
                            </button>
                        </div>

                        {/* Join Channel Area */}
                        <div className="toss-card p-6 space-y-4">
                            <label className="text-sm font-bold text-[#4e5968] block text-left ml-1">코드로 참여하기</label>
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

                    <p className="text-[#8b95a1] text-sm pt-20">
                        © 2026 Selfer. All rights reserved.
                    </p>
                </motion.div>
            </div>
        </main>
    );
}
