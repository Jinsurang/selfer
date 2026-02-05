'use client';

import { useEffect, useState, use } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, LayoutDashboard, Share2, RefreshCw, ChevronRight, Copy } from 'lucide-react';
import { Participant, Channel } from '@/lib/store';

export default function HostDashboardClient({ params }: { params: Promise<{ code: string }> }) {
    const { code } = use(params);
    const [channel, setChannel] = useState<Channel | null>(null);
    const [loadingTopics, setLoadingTopics] = useState(false);
    const [error, setError] = useState('');

    const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join/${code}` : '';

    const fetchChannel = async () => {
        try {
            const res = await fetch(`/api/channels?code=${code}`);
            const data = await res.json();
            if (res.ok) {
                setChannel(data);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const generateTopics = async () => {
        setLoadingTopics(true);
        try {
            const res = await fetch('/api/topics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code }),
            });
            if (res.ok) {
                fetchChannel();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingTopics(false);
        }
    };

    useEffect(() => {
        fetchChannel();
        const interval = setInterval(fetchChannel, 3000);
        return () => clearInterval(interval);
    }, [code]);

    if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;
    if (!channel) return <div className="p-20 text-center text-[#8b95a1] font-medium">데이터를 불러오는 중...</div>;

    return (
        <main className="min-h-screen bg-[#f2f4f6] p-6 md:p-12">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Left Column: QR & Participants */}
                <aside className="lg:w-[320px] lg:shrink-0 space-y-6">
                    <div className="toss-card p-8 flex flex-col items-center">
                        <span className="text-[#8b95a1] text-xs font-black uppercase tracking-widest mb-2">Channel Code</span>
                        <h1 className="text-4xl font-black text-[#3182f6] tracking-tight mb-8 font-mono">{code}</h1>

                        <div className="p-3 bg-white border border-[#f2f4f6] rounded-3xl shadow-sm mb-6">
                            <QRCodeSVG value={joinUrl} size={180} />
                        </div>

                        <div className="w-full space-y-4">
                            <p className="text-xs text-[#8b95a1] text-center font-bold">QR 코드를 스캔하여 입장하세요</p>
                            <div className="flex items-center gap-2 p-3 bg-[#f9fafb] rounded-xl text-[11px] font-medium text-[#4e5968] break-all border border-[#f2f4f6]">
                                <Share2 className="w-3 h-3 text-[#3182f6] shrink-0" />
                                {joinUrl.replace('http://', '').replace('https://', '')}
                            </div>
                        </div>
                    </div>

                    <div className="toss-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-[#191f28] flex items-center gap-2">
                                <Users className="w-5 h-5 text-[#3182f6]" />
                                참여 중
                                <span className="text-[#3182f6] ml-1">{channel.participants.length}</span>
                            </h3>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {channel.participants.map((p) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-3 p-4 bg-[#f9fafb] rounded-[18px] border border-transparent hover:border-[#3182f6]/20 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center font-black text-[#3182f6] text-sm shadow-sm border border-[#f2f4f6]">
                                            {p.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-[#191f28]">{p.name}</p>
                                            <p className="text-[10px] text-[#8b95a1] font-medium">
                                                {p.job || '직업 미입력'} · {p.mbti || 'MBTI 미입력'}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {channel.participants.length === 0 && (
                                <div className="text-center py-10 space-y-3">
                                    <div className="w-12 h-12 bg-[#f2f4f6] rounded-full flex items-center justify-center mx-auto">
                                        <Users className="w-6 h-6 text-[#adb5bd]" />
                                    </div>
                                    <p className="text-sm text-[#8b95a1] font-bold tracking-tight">첫 번째 참여자를<br />기다리고 있어요</p>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

                {/* Main Content: AI Topics */}
                <section className="flex-1 space-y-8">
                    <div className="toss-card p-10 min-h-[600px] flex flex-col">
                        <header className="flex items-center justify-between mb-16">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#e8f3ff] rounded-2xl flex items-center justify-center">
                                    <LayoutDashboard className="w-6 h-6 text-[#3182f6]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[#191f28] tracking-tight">생성된 대화 주제</h2>
                                    <p className="text-sm text-[#8b95a1] font-bold">AI가 참가자들의 특성을 분석해 대화를 제안합니다.</p>
                                </div>
                            </div>
                            <button
                                onClick={generateTopics}
                                disabled={loadingTopics || channel.participants.length < 1}
                                className="toss-btn-primary py-3 px-6 h-12"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingTopics ? 'animate-spin' : ''}`} />
                                {channel.topics.length > 0 ? '지문 다시 뽑기' : '주제 생성하기'}
                            </button>
                        </header>

                        <div className="flex-1 flex flex-col justify-center gap-12 max-w-2xl mx-auto w-full">
                            {channel.topics.length > 0 ? (
                                <>
                                    <motion.div
                                        key={channel.currentTopicIndex}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex justify-center">
                                            <span className="toss-badge-blue px-4 py-2 text-sm">Question {channel.currentTopicIndex + 1}</span>
                                        </div>
                                        <h1 className="text-4xl md:text-5xl font-black text-center leading-[1.3] text-[#191f28] tracking-tighter">
                                            "{channel.topics[channel.currentTopicIndex]}"
                                        </h1>
                                    </motion.div>

                                    <div className="flex justify-center pt-10">
                                        <button
                                            onClick={async () => {
                                                await fetch(`/api/channels?code=${code}&action=next`, { method: 'PATCH' });
                                                fetchChannel();
                                            }}
                                            className="group flex items-center gap-3 text-[#3182f6] text-xl font-bold hover:gap-6 transition-all"
                                        >
                                            다음 주제로 넘어가기
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#3182f6]/5 blur-3xl rounded-full scale-150" />
                                        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border border-[#f2f4f6]">
                                            <Users className={`w-12 h-12 ${channel.participants.length >= (channel.targetParticipants || 2) ? 'text-[#3182f6]' : 'text-[#e5e8eb]'}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-[#191f28]">
                                            {channel.participants.length >= (channel.targetParticipants || 2)
                                                ? '대화를 시작할 준비가 되었습니다!'
                                                : '참가자들을 모으고 있습니다'}
                                        </h2>
                                        <p className="text-[#8b95a1] font-bold">
                                            {channel.participants.length} / {channel.targetParticipants || 2} 명 입장 완료
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        {[...Array(channel.targetParticipants || 2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 rounded-full transition-all duration-500 ${i < channel.participants.length ? 'bg-[#3182f6] scale-125' : 'bg-[#e5e8eb]'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
