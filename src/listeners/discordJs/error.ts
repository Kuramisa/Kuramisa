import { Listener } from "@sapphire/framework";

export class DiscordJSErrorListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "error"
        });
    }

    async run(error: string) {
        this.container.logger.debug("[Discord.js]", error);
    }
}
