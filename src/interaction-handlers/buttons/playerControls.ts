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
                history.back();
                break;
            case "player_next":
                history.next();
                break;
            case "player_playpause":
                queue.node.setPaused(!queue.node.isPaused());
                break;
            case "player_shuffle":
                queue.tracks.shuffle();
                break;
            case "player_queue":
                music.showQueue(queue);
                break;
            case "player_loop":
                queue.setRepeatMode(
                    queue.repeatMode === 0 ? 1 : queue.repeatMode === 1 ? 2 : 0
                );
                break;
            case "player_volume_down":
                queue.node.setVolume(queue.node.volume - 10);
                break;
            case "player_volume_mute":
                if (queue.node.volume === 0) queue.node.setVolume(50);
                else queue.node.setVolume(0);
                break;
            case "player_volume_up":
                queue.node.setVolume(queue.node.volume + 10);
                break;
        }
    }
}
