import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { KEmbed, logsChannel } from "@utils";
import { GuildMember } from "discord.js";

@KEvent({
    event: "guildMemberNicknameUpdate",
    description: "Logs when member changes nickname"
})
export default class Event extends AbstractKEvent {
    async run(member: GuildMember, oldNickname: string, newNickname: string) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const embed = new KEmbed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? ""
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
