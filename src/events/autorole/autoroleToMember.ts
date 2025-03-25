import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember } from "discord.js";

@Event({
    event: "guildMemberAdd",
    description: "Adds autorole to new members",
})
export default class AutoroleToMemberEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const guild = await this.client.managers.guilds.get(member.guild.id);
        const { autorole } = guild;

        if (autorole.length < 1) return;

        await member.roles.add(autorole, "Added by autorole");
    }
}
