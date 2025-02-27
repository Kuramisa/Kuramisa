import { AbstractEvent, Event } from "classes/Event";
import { Embed } from "@builders";
import { logsChannel } from "utils";
import { GuildMember } from "discord.js";

@Event({
    event: "guildMemberNicknameUpdate",
    description: "Logs when member changes nickname",
})
export default class MemberNicknameChangeEvent extends AbstractEvent {
    async run(member: GuildMember, oldNickname: string, newNickname: string) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(`${member.user.username} Changed Nickname`)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(
                `\`Old\`: ${oldNickname ? oldNickname : "None"}\n\`New\`: ${
                    newNickname ? newNickname : "None"
                }`
            );

        channel.send({ embeds: [embed] });
    }
}
