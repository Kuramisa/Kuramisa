import { Listener } from "@sapphire/framework";
import { ChannelType, type VoiceState } from "discord.js";

export class DynamicVCListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Dynamic Voice Channels",
            event: "voiceStateUpdate"
        });
    }

    async run(_: VoiceState, state: VoiceState) {
        if (!state.channel) return;

        const { database } = this.container;
        const { guild, channel } = state;
        const { parent } = channel;

        if (!parent) return;

        if (channel.type !== ChannelType.GuildVoice) return;

        const db = await database.guilds.fetch(guild.id);

        const dvc = db.dvc.find((d) => d.id === channel.id);

        if (!dvc) return;

        const parentVC = guild.channels.cache.get(dvc.parentId);
        if (!parentVC || parentVC.type !== ChannelType.GuildVoice) return;

        const similarChannels = parent.children.cache.filter((c) =>
            c.name.startsWith(parentVC.name)
        );

        const newChannel = await guild.channels.create({
            name: `${parentVC.name} ${similarChannels.size + 1}`,
            parent: channel.parent,
            type: ChannelType.GuildVoice
        });

        await newChannel.setPosition(channel.position + 1);

        db.dvc.push({
            parentId: parentVC.id,
            id: newChannel.id,
            categoryId: parent.id
        });
        db.markModified("dvc");
        await db.save();
    }
}
