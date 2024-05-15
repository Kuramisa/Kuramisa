import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { Guild } from "discord.js";

@KEvent({
    event: "guildCreate",
    description: "When bot join a guild"
})
export default class GuildJoinedEvent extends AbstractKEvent {
    async run(guild: Guild) {
        this.client.managers.guilds.create(guild);
    }
}
