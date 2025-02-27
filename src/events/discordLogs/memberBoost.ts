import { Embed } from "@builders";
import { AbstractEvent, Event } from "classes/Event";

import { GuildMember } from "discord.js";
import { logsChannel } from "utils";

@Event({
    event: "guildMemberBoost",
    description: "Member boosted a guild",
})
export default class MemberBoostEvent extends AbstractEvent {
    async run(member: GuildMember) {
        const { guild } = member;

        const channel = await logsChannel(guild);
        if (!channel) return;

        const embed = new Embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() ?? "",
            })
            .setTitle(`${member.user.username} Boosted the server`)
            .setThumbnail(member.displayAvatarURL());

        channel.send({ embeds: [embed] });
    }
}
