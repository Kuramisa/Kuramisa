import { Listener } from "@sapphire/framework";
import type { GuildMember } from "discord.js";

export default class AutoroleToMemberEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberAdd",
            description: "Adds autorole to new members.",
        });
    }

    async run(member: GuildMember) {
        const guild = await member.client.managers.guilds.get(member.guild.id);
        const { autorole } = guild;

        if (autorole.length < 1) return;

        await member.roles.add(autorole, "Added by autorole");
    }
}
