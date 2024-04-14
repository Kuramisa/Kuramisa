import { Listener } from "@sapphire/framework";
import { type Message } from "discord.js";

export class WordFilterListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Filter Media from messages",
            event: "messageCreate"
        });
    }

    async run(message: Message) {
        if (message.author.bot) return;

        const { moderation } = this.container;

        await moderation.moderate(message);
    }
}
