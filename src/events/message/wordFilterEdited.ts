import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Message } from "discord.js";

@KEvent({
    event: "messageUpdate",
    description: "Filter words in edited messages"
})
export default class WordFilterEditedEvent extends AbstractKEvent {
    async run(_: Message, message: Message) {
        if (message.author.bot) return;

        const { moderation } = this.client;

        moderation.moderate(message);
    }
}
