import type { GuildTextBasedChannel, Message, VoiceChannel } from "discord.js";

export interface QueueMetadata {
    message?: Message | null;
    textChannel: GuildTextBasedChannel;
    voiceChannel: VoiceChannel;
}
export interface PlaylistTrack {
    id: string;
    title: string;
    description: string;
    author: string;
    url: string;
    thumbnail: string;
    duration: string;
    durationMS: number;
    views: number;
}

export interface Playlist {
    id: string;
    name: string;
    description?: string;
    cover?: {
        key?: string;
        url: string;
    };
    tracks: PlaylistTrack[];
}
