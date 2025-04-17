import { Embed } from "Builders";
import { AbstractEvent, Event } from "classes/Event";
import type { GuildMember } from "discord.js";

@Event({
    event: "guildMemberNicknameUpdate",
    description: "Logs when member changes nickname",
})
export default class MemberNicknameChangeEvent extends AbstractEvent {
    async run(
        member: GuildMember,
        oldNickname: string | null,
        newNickname: string | null,
    ) {
        if (oldNickname === newNickname) return;
        const {
            client: { managers },
            guild,
        } = member;

        const channel = await managers.guilds.logsChannel(guild);
        if (!channel) return;

        const db = await managers.guilds.get(guild.id);
        if (!db.logs.types.memberNicknameChange) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(`${member.user.displayName} Changed Nickname`)
            .setThumbnail(member.displayAvatarURL())
            .setDescription(
                `\`Old\`: ${oldNickname ?? "None"}\n\`New\`: ${
                    newNickname ?? "None"
                }`,
            );

        await channel.send({ embeds: [embed] });
    }
}
