import { Listener, container } from "@sapphire/framework";

export class PlayerDebugListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "debug",
            emitter: container.systems.music.events
        });
    }

    async run(_: any, debug: string) {
        this.container.logger.debug("[Music Player]", debug);
    }
}
