import { Listener } from "@sapphire/framework";

export default class UnhandledRejectionEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "unhandledRejection",
            name: "unhandled-rejection",
            description: "Event that triggers when a promise is rejected",
            emitter: process,
        });
    }
    run(reason: any, promise: any) {
        this.container.logger.error(
            `[Unhandled Rejection] ${reason} Promise: ${promise}`,
        );
    }
}
