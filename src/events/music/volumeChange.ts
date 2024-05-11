import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { KEmbed } from "@builders";
import { GuildQueue } from "discord-player";
import { toEmoji } from "@utils";

@KEvent({
    event: "volumeChange",
    description:
        "Event that triggers when the volume of a music player changes",
    emitter: kuramisa.systems.music.events
})
export default class Event extends AbstractKEvent {
    async run(queue: GuildQueue, _: number, newVolume: number) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.client;

        if (!guild.musicMessage) return;

        const plainEmbed = guild.musicMessage.embeds[0];
        const embed = KEmbed.from(plainEmbed);
        if (!plainEmbed.description) return;

        const oldVolumeText = plainEmbed.description.split("\n")[0];
        const newVolumeText = `${await toEmoji(music.volumeEmoji(newVolume))} **Volume**: ${newVolume}%`;

        guild.musicMessage.edit({
            content: "",
            embeds: [
                embed.setDescription(
                    plainEmbed.description.replace(oldVolumeText, newVolumeText)
                )
            ],
            components: music.playerControls()
        });
    }
}
