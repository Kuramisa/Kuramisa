import { container, Listener } from "@sapphire/framework";

export default class MusicDebugEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "debug",
            description: "Debug event for music system",
            emitter: container.client.systems.music,
        });
    }

    run(debug: string) {
        container.logger.debug(`[Music] ${debug}`);
    }
}
