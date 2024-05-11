import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { KEmbed, logsChannel } from "@utils";
import { GuildMember } from "discord.js";

@KEvent({
    event: "guildMemberBoost",
    description: "Member boosted a guild"
})
export default class Event extends AbstractKEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const embed = new KEmbed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? ""
            })
            .setTitle(`${member.user.username} Boosted the server`)
            .setThumbnail(member.displayAvatarURL());

        channel.send({ embeds: [embed] });
    }
}
