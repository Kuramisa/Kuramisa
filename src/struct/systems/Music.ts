import {
    AppleMusicExtractor,
    AttachmentExtractor,
    ReverbnationExtractor,
    SoundCloudExtractor,
    SpotifyExtractor,
    VimeoExtractor,
    YoutubeExtractor,
    lyricsExtractor,
} from "@discord-player/extractor";

import { container } from "@sapphire/framework";
import {Player} from "discord-player";
import type {
    ChatInputCommandInteraction,
    Guild,
    GuildTextChannelResolvable,
    GuildVoiceChannelResolvable,
} from "discord.js";

export default class Music extends Player {
    lyrics: ReturnType<typeof lyricsExtractor>;

    constructor() {
        super(container.client, {
            ytdlOptions: {
                filter: "audioonly",
            },
        });

        this.extractors.register(AppleMusicExtractor, {});
        this.extractors.register(AttachmentExtractor, {});
        this.extractors.register(YoutubeExtractor, {});
        this.extractors.register(ReverbnationExtractor, {});
        this.extractors.register(SoundCloudExtractor, {});
        this.extractors.register(SpotifyExtractor, {});
        this.extractors.register(VimeoExtractor, {});

        this.lyrics = lyricsExtractor();
    }

    newQueue = async (
        interaction: ChatInputCommandInteraction,
        guild: Guild,
        channel: GuildTextChannelResolvable | GuildVoiceChannelResolvable
    ) =>
        super.queues.create(guild, {
            metadata: {
                interaction,
                guild,
                channel,
            },
            selfDeaf: true,
            volume: 70,
            leaveOnEmpty: true,
            leaveOnEmptyCooldown: 60000,
            leaveOnEnd: true,
            leaveOnStop: true,
            leaveOnEndCooldown: 60000,
        });
}
