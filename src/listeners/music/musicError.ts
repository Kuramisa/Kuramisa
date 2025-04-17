import { container, Listener } from "@sapphire/framework";

export default class MusicErrorEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "error",
            name: "music-error",
            description: "Error event for music system",
            emitter: container.client.systems.music,
        });
    }

    run(error: string) {
        container.logger.error(`[Music] ${error}`);
    }
}
