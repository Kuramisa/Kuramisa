import { Listener } from "@sapphire/framework";
import { Embed } from "Builders";
import type { GuildMember } from "discord.js";

export default class MemberBoostEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, {
            ...options,
            event: "guildMemberBoost",
            description: "Logs when member boosts the server",
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
        if (!db.logs.types.memberBoost) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(`${member.user.displayName} boosted the server`)
            .setThumbnail(member.displayAvatarURL());

        await channel.send({ embeds: [embed] });
    }
}
