import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember } from "discord.js";

@Event({
    event: "guildMemberUnboost",
    description: "Member unboosted a guild",
})
export default class MemberUnboostEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel =
            await this.container.client.managers.guilds.logsChannel(guild);
        if (!channel) return;

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
