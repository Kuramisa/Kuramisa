import { AbstractEvent, Event } from "classes/Event";
@Event({
    event: "unhandledRejection",
    description: "Unhandled rejection event",
    emitter: process,
})
export default class UnhandledRejectionEvent extends AbstractEvent {
    run(reason: any, promise: any) {
        this.container.logger.error(
            `[Unhandled Rejection] ${reason} Promise: ${promise}`,
        );
    }
}
