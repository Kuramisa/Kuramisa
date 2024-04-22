import { Listener, container } from "@sapphire/framework";

export class MusicErrorListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "error",
            emitter: container.systems.music
        });
    }

    async run(error: string) {
        this.container.logger.error("[Music]", error);
    }
}
