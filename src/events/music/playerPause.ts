import { AbstractKEvent, KEvent } from "@classes/KEvent";
import kuramisa from "@kuramisa";
import { GuildQueue } from "discord-player";

@KEvent({
    event: "playerPause",
    description: "Pause event for music player",
    emitter: kuramisa.systems.music.events
})
export default class PlayerPauseEvent extends AbstractKEvent {
    async run(queue: GuildQueue) {
        const { guild } = queue;

        const {
            systems: { music }
        } = this.client;

        if (!guild.musicMessage) return;

        guild.musicMessage.edit({
            content: "",
            components: music.playerControls(true)
        });
    }
}
