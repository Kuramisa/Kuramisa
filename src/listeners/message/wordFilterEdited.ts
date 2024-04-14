import { Listener } from "@sapphire/framework";
import { type Message } from "discord.js";

export class WordFilterEditedListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Filter Media from edited messages",
            event: "messageUpdate"
        });
    }

    async run(_: Message, message: Message) {
        if (!message.author) return;

        const { moderation } = this.container;

        await moderation.moderate(message);
    }
}
