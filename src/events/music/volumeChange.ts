import { container } from "@sapphire/framework";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";
import type { QueueMetadata } from "typings/Music";

@Event({
    event: "volumeChange",
    description:
        "Event that triggers when the volume of a music player changes",
    emitter: container.client.systems.music.events,
})
export default class VolumeChangeEvent extends AbstractEvent {
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
