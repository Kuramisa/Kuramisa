import { Listener } from "@sapphire/framework";
import { type Message } from "discord.js";

export class VideoModerationListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Filter Media from videos",
            event: "messageCreate"
        });
    }

    async run(message: Message) {
        if (message.author.bot) return;

        const { database, moderation, util } = this.container;

        if (!message.guild) return;

        const { guild } = message;

        const db = await database.guilds.fetch(guild.id);
        if (!db.filters.media.enabled) return;

        if (message.author.id === this.container.client.user?.id) return;
        const videos = message.attachments
            .toJSON()
            .filter((a) => a.contentType?.startsWith("video/"));
        const embeds = message.embeds;

        let reasons: string[] = [];

        for (let i = 0; i < embeds.length; i++) {
            const { data: embed } = embeds[i];
            let moderated;
            if (embed.type === "image") {
                if (!embed.url) continue;
                moderated = await moderation.video(embed.url);
            } else {
                if (!embed.video) continue;
                if (!embed.video.proxy_url) continue;
                moderated = await moderation.video(embed.video.proxy_url);
            }

            reasons.push(...moderated);
        }

        for (let i = 0; i < videos.length; i++) {
            const { url } = videos[i];
            const moderated = await moderation.video(url);
            reasons.push(...moderated);
        }

        reasons = reasons.filter((r, i) => reasons.indexOf(r) === i);

        if (reasons.length < 1) return;

        await message.delete().catch(() => null);
        await message.channel.send({
            content: `${
                message.author
            }, your message was removed because it contained \`${util.conj(
                reasons
            )}\``
        });
    }
}
