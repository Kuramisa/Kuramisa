import { Listener } from "@sapphire/framework";
import { type Message } from "discord.js";

export class ImageModerationListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Image Moderation",
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
        const images = message.attachments
            .filter((a) => a.contentType?.startsWith("image/"))
            .toJSON();
        if (images.length === 0) return;

        let reasons: string[] = [];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            const moderated = await moderation.image(image.proxyURL);
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
