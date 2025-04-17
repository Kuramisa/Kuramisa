import { container, Listener } from "@sapphire/framework";
import type { GuildQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";
import type { QueueMetadata } from "typings/Music";

export default class VolumeChangeEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "volumeChange",
            description:
                "Event that triggers when the volume of a music player changes",
            emitter: container.client.systems.music.events,
        });
    }

    async run(
        queue: GuildQueue<QueueMetadata>,
        oldVolume: number,
        newVolume: number,
    ) {
        const {
            systems: { music },
        } = container.client;
        const { message } = queue.metadata;

        if (!message) return;

        const plainEmbed = message.embeds[0];
        const embed = EmbedBuilder.from(plainEmbed);
        if (!plainEmbed.description) return;

        await message.edit({
            content: "",
            embeds: [
                embed.setDescription(
                    plainEmbed.description.replaceAll(
                        oldVolume.toString(),
                        newVolume.toString(),
                    ),
                ),
            ],
            components: music.playerControls(queue.node.isPaused()),
        });
    }
}
