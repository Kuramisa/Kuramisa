import { Listener } from "@sapphire/framework";

export class UnhandledRejectionListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "unhandledRejection",
            emitter: process
        });
    }

    async run(error: Error) {
        this.container.logger.error(error);
    }
}
