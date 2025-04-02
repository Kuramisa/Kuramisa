import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember } from "discord.js";

@Event({
    event: "guildMemberBoost",
    description: "Member boosted a guild",
})
export default class MemberBoostEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel =
            await this.container.client.managers.guilds.logsChannel(guild);
        if (!channel) return;

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
