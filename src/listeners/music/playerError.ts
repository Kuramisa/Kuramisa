import { Listener, container } from "@sapphire/framework";

export class PlayerErrorListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "playerError",
            emitter: container.systems.music.events
        });
    }

    async run(_: any, error: string) {
        this.container.logger.error("[Music Player]", error);
    }
}
