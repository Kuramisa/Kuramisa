import { KEmbed } from "@builders";
import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { logsChannel } from "@utils";
import { GuildMember } from "discord.js";

@KEvent({
    event: "guildMemeberUnboost",
    description: "Member unboosted a guild"
})
export default class Event extends AbstractKEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const embed = new KEmbed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() as string
            })
            .setTitle(
                `${member.user.username} Removed the boost from the server`
            )
            .setThumbnail(member.displayAvatarURL());

        channel.send({ embeds: [embed] });
    }
}
