import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Message } from "discord.js";

@KEvent({
    event: "messageCreate",
    description: "Filter words in messages"
})
export default class Event extends AbstractKEvent {
    async run(message: Message) {
        if (message.author.bot) return;

        const { moderation } = this.client;

        moderation.moderate(message);
    }
}
