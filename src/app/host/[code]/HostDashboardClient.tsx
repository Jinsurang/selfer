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
        <main className="min-h-screen bg-[var(--background)] p-6 md:p-12">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">

                {/* Left Column: QR & Participants */}
                <aside className="lg:w-[320px] lg:shrink-0 space-y-6">
                    <div className="toss-card p-8 flex flex-col items-center">
                        <span className="text-[var(--text-light)] text-xs font-black uppercase tracking-widest mb-2">Channel Code</span>
                        <h1 className="text-4xl font-black text-[var(--accent)] tracking-tight mb-8 font-mono">{code}</h1>

                        <div className="p-3 bg-white border border-[var(--border)] rounded-3xl shadow-sm mb-6">
                            <QRCodeSVG value={joinUrl} size={180} />
                        </div>

                        <div className="w-full space-y-4">
                            <p className="text-xs text-[var(--text-light)] text-center font-bold">QR 코드를 스캔하여 입장하세요</p>
                            <div className="flex items-center gap-2 p-3 bg-white rounded-xl text-[11px] font-medium text-[var(--text-sub)] break-all border border-[var(--border)]">
                                <Share2 className="w-3 h-3 text-[var(--accent)] shrink-0" />
                                {joinUrl.replace('http://', '').replace('https://', '')}
                            </div>
                        </div>
                    </div>

                    <div className="toss-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                                <Users className="w-5 h-5 text-[var(--accent)]" />
                                참여 중
                                <span className="text-[var(--accent)] ml-1">{channel.participants.length}</span>
                            </h3>
                        </div>

                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence>
                                {channel.participants.map((p) => {
                                    const isMe = typeof window !== 'undefined' && localStorage.getItem(`selfer_${code}`) === p.id;
                                    return (
                                        <motion.div
                                            key={p.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex flex-col gap-2 p-4 bg-white rounded-[22px] border-2 transition-all ${isMe ? 'border-[var(--accent)] shadow-sm' : 'border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shadow-sm border ${isMe ? 'bg-[var(--accent)] text-white border-transparent' : 'bg-white text-[var(--accent)] border-[var(--border)]'}`}>
                                                    {p.name[0]}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-sm text-[var(--text-main)]">{p.name}</p>
                                                        {isMe && <span className="px-1.5 py-0.5 rounded-md bg-[var(--accent)] text-[8px] font-black text-[#F7F3E9] uppercase">Me</span>}
                                                    </div>
                                                    <p className="text-[10px] text-[var(--accent)] font-black uppercase tracking-wider">{p.mbti}</p>
                                                </div>
                                            </div>

                                            <div className="pl-1 space-y-1">
                                                <div className="flex items-start gap-1.5">
                                                    <span className="text-[9px] font-black text-[var(--text-light)] shrink-0 mt-0.5 uppercase">Life</span>
                                                    <p className="text-[11px] text-[var(--text-sub)] font-medium leading-tight">{p.interests}</p>
                                                </div>
                                                <div className="flex items-start gap-1.5">
                                                    <span className="text-[9px] font-black text-[var(--text-light)] shrink-0 mt-0.5 uppercase">Self</span>
                                                    <p className="text-[11px] text-[var(--text-sub)] font-medium leading-tight">{p.personality}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            {channel.participants.length === 0 && (
                                <div className="text-center py-10 space-y-3">
                                    <div className="w-12 h-12 bg-[var(--background)] rounded-full flex items-center justify-center mx-auto">
                                        <Users className="w-6 h-6 text-[var(--text-light)]" />
                                    </div>
                                    <p className="text-sm text-[var(--text-light)] font-bold tracking-tight">첫 번째 참여자를<br />기다리고 있어요</p>
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
                                <div className="w-12 h-12 bg-[#E8E2D2] rounded-2xl flex items-center justify-center">
                                    <LayoutDashboard className="w-6 h-6 text-[var(--accent)]" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tight">생성된 대화 주제</h2>
                                    <p className="text-sm text-[var(--text-light)] font-bold">AI가 참가자들의 특성을 분석해 대화를 제안합니다.</p>
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
                                        <h1 className="text-4xl md:text-5xl font-black text-center leading-[1.3] text-[var(--text-main)] tracking-tighter">
                                            "{channel.topics[channel.currentTopicIndex]}"
                                        </h1>
                                    </motion.div>

                                    <div className="flex justify-center pt-10">
                                        <button
                                            onClick={async () => {
                                                await fetch(`/api/channels?code=${code}&action=next`, { method: 'PATCH' });
                                                fetchChannel();
                                            }}
                                            className="group flex items-center gap-3 text-[var(--accent)] text-xl font-bold hover:gap-6 transition-all"
                                        >
                                            다음 주제로 넘어가기
                                            <ChevronRight className="w-6 h-6" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center space-y-8">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-[#1B4332]/5 blur-3xl rounded-full scale-150" />
                                        <div className="relative w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto border border-[var(--border)]">
                                            <Users className={`w-12 h-12 ${channel.participants.length >= (channel.targetParticipants || 2) ? 'text-[var(--accent)]' : 'text-[#e5e8eb]'}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black text-[var(--text-main)]">
                                            {channel.participants.length >= (channel.targetParticipants || 2)
                                                ? '대화를 시작할 준비가 되었습니다!'
                                                : '참가자들을 모으고 있습니다'}
                                        </h2>
                                        <p className="text-[var(--text-light)] font-bold">
                                            {channel.participants.length} / {channel.targetParticipants || 2} 명 입장 완료
                                        </p>
                                    </div>

                                    <div className="flex justify-center gap-2">
                                        {[...Array(channel.targetParticipants || 2)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 rounded-full transition-all duration-500 ${i < channel.participants.length ? 'bg-[var(--accent)] scale-125' : 'bg-[#e5e8eb]'}`}
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
