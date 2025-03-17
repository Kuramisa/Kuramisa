import kuramisa from "@kuramisa";
import { AbstractEvent, Event } from "classes/Event";
import { GuildQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";

@Event({
    event: "volumeChange",
    description:
        "Event that triggers when the volume of a music player changes",
    emitter: kuramisa.systems.music.events,
})
export default class VolumeChangeEvent extends AbstractEvent {
    async run(
        queue: GuildQueue<QueueMetadata>,
        oldVolume: number,
        newVolume: number
    ) {
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        if (!guild.musicMessage) return;

        const plainEmbed = guild.musicMessage.embeds[0];
        const embed = EmbedBuilder.from(plainEmbed);
        if (!plainEmbed.description) return;

        guild.musicMessage.edit({
            content: "",
            embeds: [
                embed.setDescription(
                    plainEmbed.description.replaceAll(
                        oldVolume.toString(),
                        newVolume.toString()
                    )
                ),
            ],
            components: music.playerControls(),
        });
    }
}
