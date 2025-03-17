import { AbstractEvent, Event } from "classes/Event";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";

@Event({
    event: "playerPause",
    description: "Pause event for music player",
    emitter: kuramisa.systems.music.events,
})
export default class PlayerPauseEvent extends AbstractEvent {
    async run(queue: GuildQueue<QueueMetadata>) {
        const { guild } = queue;

        const {
            systems: { music },
        } = this.client;

        if (!guild.musicMessage) return;

        guild.musicMessage.edit({
            content: "",
            components: music.playerControls(true),
        });
    }
}
