import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";

@KEvent({
    event: "playerResume",
    description: "Event that triggers when a music player is resumed",
    emitter: kuramisa.systems.music.events
})
export default class Event extends AbstractKEvent {
    async run(queue: GuildQueue) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.client;

        if (!guild.musicMessage) return;

        guild.musicMessage.edit({
            content: "",
            components: music.playerControls()
        });
    }
}
