import { Listener, container } from "@sapphire/framework";
import { GuildQueue } from "discord-player";

export class PlayerPauseListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "playerPause",
            emitter: container.systems.music.events
        });
    }

    async run(queue: GuildQueue) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.container;

        if (!guild.musicMessage) return;

        guild.musicMessage.edit({
            components: music.playerControls(true)
        });
    }
}