import {
    InteractionHandler,
    InteractionHandlerTypes
} from "@sapphire/framework";
import { ButtonInteraction } from "discord.js";
import { useQueue } from "discord-player";

export class PlayerControlsHandler extends InteractionHandler {
    constructor(
        ctx: InteractionHandler.LoaderContext,
        opts: InteractionHandler.Options
    ) {
        super(ctx, {
            ...opts,
            interactionHandlerType: InteractionHandlerTypes.Button
        });
    }

    override parse(interaction: ButtonInteraction) {
        if (
            ![
                "player_previous",
                "player_next",
                "player_playpause",
                "player_shuffle",
                "player_queue",
                "player_loop",
                "player_volume_down",
                "player_volume_mute",
                "player_volume_up"
            ].includes(interaction.customId)
        )
            return this.none();

        return this.some();
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.guildId) return;

        const queue = useQueue(interaction.guildId);
        if (!queue)
            return interaction.reply({
                content: ">🚫 There is no music playing in this server.",
                ephemeral: true
            });

        const { history } = queue;

        const {
            systems: { music }
        } = this.container;

        switch (interaction.customId) {
            case "player_previous":
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `> 🚫 You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });
                history.back();
                break;
            case "player_next":
                if (
                    queue.currentTrack &&
                    queue.currentTrack.requestedBy?.id !== interaction.user.id
                )
                    return interaction.reply({
                        content: `> 🚫 You didn't request current track playing, ask ${queue.currentTrack.requestedBy} to skip the track, as they requested it`,
                        ephemeral: true
                    });
                history.next();
                return interaction.reply({
                    content: "> ⏭️ Skipped the current track",
                    ephemeral: true
                });
            case "player_playpause":
                queue.node.setPaused(!queue.node.isPaused());
                return interaction.reply({
                    content: `> ${
                        queue.node.isPaused() ? "⏸️ Paused" : "▶️ Resumed"
                    } the player`,
                    ephemeral: true
                });
            case "player_shuffle":
                queue.tracks.shuffle();
                return interaction.reply({
                    content: "> 🔀 Shuffled the queue",
                    ephemeral: true
                });
            case "player_queue":
                music.showQueue(interaction, queue);
                break;
            case "player_loop":
                music.askForLoopMode(interaction, queue);
                break;
            case "player_volume_down":
                queue.node.setVolume(queue.node.volume - 10);
                return interaction.reply({
                    content: `> 🔉 Volume set to ${queue.node.volume}%`,
                    ephemeral: true
                });
            case "player_volume_mute":
                if (queue.node.volume === 0) queue.node.setVolume(50);
                else queue.node.setVolume(0);
                return interaction.reply({
                    content: `> ${
                        queue.node.volume === 0 ? "🔇 Muted" : "🔊 Unmuted"
                    } the player`,
                    ephemeral: true
                });
            case "player_volume_up":
                queue.node.setVolume(queue.node.volume + 10);
                return interaction.reply({
                    content: `> 🔊 Volume set to ${queue.node.volume}%`,
                    ephemeral: true
                });
        }
    }
}
