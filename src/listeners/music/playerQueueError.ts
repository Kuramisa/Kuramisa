import { Listener, container } from "@sapphire/framework";

export class PlayerQueueErrorListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "error",
            emitter: container.systems.music.events
        });
    }

    async run(_: any, error: string) {
        this.container.logger.error("[Music Queue]", error);
    }
}
