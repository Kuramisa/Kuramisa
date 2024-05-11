import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Message } from "discord.js";

@KEvent({
    event: "messageDelete",
    description: "Event that triggers when a music message is deleted"
})
export default class Event extends AbstractKEvent {
    async run(message: Message) {
        if (!message.guild) return;

        const { guild } = message;

        if (guild.musicMessage && message.id === guild.musicMessage.id) {
            guild.musicMessage = null;
        }
    }
}
