import { Embed } from "@builders";
import { AbstractEvent, Event } from "classes/Event";
import { logsChannel } from "utils";
import { GuildMember } from "discord.js";

@Event({
    event: "guildMemeberUnboost",
    description: "Member unboosted a guild",
})
export default class MemberUnboostEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? undefined,
            })
            .setTitle(
                `${member.user.username} Removed the boost from the server`
            )
            .setThumbnail(member.displayAvatarURL());

        channel.send({ embeds: [embed] });
    }
}
