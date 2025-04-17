import { Listener } from "@sapphire/framework";
import { Embed } from "Builders";
import type { GuildMember } from "discord.js";

export default class MemberUnboostEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberUnboost",
            description: "Logs when a member unboosts the server",
        });
    }

    async run(member: GuildMember) {
        const {
            client: { managers },
            guild,
        } = member;

        const channel = await managers.guilds.logsChannel(guild);
        if (!channel) return;

        const db = await managers.guilds.get(guild.id);
        if (!db.logs.types.memberUnboost) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? undefined,
            })
            .setTitle(`${member.displayName} removed the boost from the server`)
            .setThumbnail(member.displayAvatarURL());

        await channel.send({ embeds: [embed] });
    }
}
