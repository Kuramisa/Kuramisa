import { AbstractEvent, Event } from "classes/Event";
import { Message } from "discord.js";

@Event({
    event: "messageDelete",
    description: "Event that triggers when a music message is deleted",
})
export default class MusicMessageDeletedEvent extends AbstractEvent {
    async run(message: Message) {
        if (!message.guild) return;

        const { guild } = message;

        if (guild.musicMessage && message.id === guild.musicMessage.id) {
            guild.musicMessage = null;
        }
    }
}
