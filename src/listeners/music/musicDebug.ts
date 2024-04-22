import { Listener, container } from "@sapphire/framework";

export class MusicDebugListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "debug",
            emitter: container.systems.music
        });
    }

    async run(debug: string) {
        this.container.logger.debug("[Music]", debug);
    }
}
