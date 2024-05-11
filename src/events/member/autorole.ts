import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { GuildMember } from "discord.js";

@KEvent({
    event: "guildMemberAdd",
    description: "Autorole for new members"
})
export default class Event extends AbstractKEvent {
    async run(member: GuildMember) {
        const { managers } = this.client;

        const guild = await managers.guilds.get(member.guild.id);

        if (guild.autorole.length < 1) return;

        for (const role of guild.autorole) {
            await member.roles.add(role);
        }
    }
}
