import { Listener } from "@sapphire/framework";
import { ChannelType, VoiceState } from "discord.js";

export class DeleteEmptyChannelListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Delete empty Dynamic channels",
            event: "voiceStateUpdate",
        });
    }

    async run(oldState: VoiceState) {
        const { database, logger } = this.container;

        try {
            const { guild, member, channel } = oldState;
            if (!member || !channel) return;
            const { parent } = channel;
            if (!parent) return;

            const db = await database.guilds.fetch(guild.id);

            const dvc = db.dvc.find((d) => d.id === channel.id);

            if (!dvc) return;

            const channels = parent.children.cache.filter((ch) =>
                ch.name.startsWith(channel.name)
            );

            channels.map(async (ch) => {
                try {
                    if (ch.type !== ChannelType.GuildVoice) return;
                    if (ch.members.size > 0) return;
                    if (ch.id === dvc.parentId) return;
                    db.dvc = db.dvc.filter((vc) => vc.id !== ch.id);
                    await ch.delete();
                } catch (error) {
                    logger.error(error);
                    logger.error("Error with mapping Dynamic Voice Channels");
                    return;
                }
            });

            db.markModified("dvc");
            await db.save();
        } catch (error) {
            logger.error(error);
            logger.error("Error with deleting Dynamic Voice Channels");
        }
    }
}
