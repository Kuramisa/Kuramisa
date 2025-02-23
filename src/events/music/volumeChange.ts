import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import { Embed } from "@builders";
import { GuildQueue } from "discord-player";
import type { GuildTextBasedChannel } from "discord.js";

@Event({
    event: "volumeChange",
    description:
        "Event that triggers when the volume of a music player changes",
    emitter: kuramisa.systems.music.events,
})
export default class VolumeChangeEvent extends AbstractEvent {
    async run(
        queue: GuildQueue<GuildTextBasedChannel>,
        oldVolume: number,
        newVolume: number
    ) {
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        if (!guild.musicMessage) return;

        const plainEmbed = guild.musicMessage.embeds[0];
        const embed = Embed.from(plainEmbed);
        if (!plainEmbed.description) return;

        const oldVolumeText = `${music.volumeEmoji(oldVolume)} **Volume**: ${oldVolume}%`;
        const newVolumeText = `${music.volumeEmoji(newVolume)} **Volume**: ${newVolume}%`;

        guild.musicMessage.edit({
            content: "",
            embeds: [
                embed.setDescription(
                    plainEmbed.description.replace(oldVolumeText, newVolumeText)
                ),
            ],
            components: music.playerControls(),
        });
    }
}
