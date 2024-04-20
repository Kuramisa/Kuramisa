import { Listener } from "@sapphire/framework";
import { Message } from "discord.js";

export class GuildMessageDeletedListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            event: "messageDelete"
        });
    }

    async run(message: Message) {
        if (!message.guild) return;
        const { guild } = message;

        if (guild.musicMessage && message.id === guild.musicMessage.id) {
            guild.musicMessage = null;
        }
    }
}
