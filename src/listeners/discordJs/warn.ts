import { Listener } from "@sapphire/framework";

export class DiscordJSDebugListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "warn"
        });
    }

    async run(warn: string) {
        this.container.logger.debug("[Discord.js]", warn);
    }
}
