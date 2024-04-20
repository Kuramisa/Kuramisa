import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";
import { EmbedBuilder } from "discord.js";

export class VolumeChangeListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "volumeChange",
            emitter: container.systems.music.events
        });
    }

    async run(queue: GuildQueue, _: number, newVolume: number) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.container;

        if (!guild.musicMessage) return;

        const plainEmbed = guild.musicMessage.embeds[0];
        const embed = EmbedBuilder.from(plainEmbed);
        if (!plainEmbed.description) return;

        const oldVolumeText = plainEmbed.description.split("\n")[0];
        const newVolumeText = `${music.volumeEmoji(newVolume)} **Volume**: ${newVolume}%`;

        guild.musicMessage.edit({
            embeds: [
                embed.setDescription(
                    plainEmbed.description.replace(oldVolumeText, newVolumeText)
                )
            ],
            components: music.playerControls()
        });
    }
}
