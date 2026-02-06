export type Participant = {
    id: string;
    name: string;
    age?: number;
    mbti?: string;
    interests: string[]; // Emoji-based interests
};

export type Channel = {
    code: string;
    participants: Participant[];
    topics: string[];
    currentTopicIndex: number;
    targetParticipants?: number;
    status: 'waiting' | 'playing';
};

// Types for Cloudflare KV binding
interface KVNamespace {
    get(key: string, type: 'json'): Promise<any>;
    put(key: string, value: string): Promise<void>;
}

// In-memory fallback for local development
const globalChannels = global as unknown as { channels: Map<string, Channel> };
if (!globalChannels.channels) {
    globalChannels.channels = new Map();
}

/**
 * Cloudflare KV Helper
 * In Next.js App Router on Cloudflare, bindings are usually on process.env
 */
const getKV = () => (process.env.SELFER_KV as unknown as KVNamespace) || null;

export const store = {
    getChannel: async (code: string): Promise<Channel | null> => {
        const kv = getKV();
        const keyCode = `channel:${code.toUpperCase()}`;

        if (kv) {
            return await kv.get(keyCode, 'json');
        }
        return globalChannels.channels.get(code.toUpperCase()) || null;
    },

    saveChannel: async (channel: Channel): Promise<void> => {
        const kv = getKV();
        const keyCode = `channel:${channel.code.toUpperCase()}`;

        if (kv) {
            await kv.put(keyCode, JSON.stringify(channel));
        } else {
            globalChannels.channels.set(channel.code.toUpperCase(), channel);
        }
    },

    createChannel: async (targetParticipants?: number, hostInfo?: Participant): Promise<Channel> => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const newChannel: Channel = {
            code,
            participants: hostInfo ? [hostInfo] : [],
            topics: [],
            currentTopicIndex: -1,
            targetParticipants,
            status: 'waiting',
        };

        await store.saveChannel(newChannel);
        return newChannel;
    },

    addParticipant: async (code: string, participant: Participant): Promise<boolean> => {
        const channel = await store.getChannel(code);
        if (channel) {
            const exists = channel.participants.find(p => p.id === participant.id);
            if (!exists) {
                channel.participants.push(participant);
                await store.saveChannel(channel);
            }
            return true;
        }
        return false;
    },

    setTopics: async (code: string, topics: string[]): Promise<boolean> => {
        const channel = await store.getChannel(code);
        if (channel) {
            channel.topics = topics;
            channel.currentTopicIndex = topics.length > 0 ? 0 : -1;
            await store.saveChannel(channel);
            return true;
        }
        return false;
    },

    nextTopic: async (code: string): Promise<boolean> => {
        const channel = await store.getChannel(code);
        if (channel && channel.topics.length > 0) {
            channel.currentTopicIndex = (channel.currentTopicIndex + 1) % channel.topics.length;
            await store.saveChannel(channel);
            return true;
        }
        return false;
    }
};
