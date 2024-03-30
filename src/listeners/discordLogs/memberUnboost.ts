import { Listener } from "@sapphire/framework";
import { GuildMember } from "discord.js";

export class MemberUnboostLogListener extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Logs when member unboosts a server",
            event: "guildMemberUnboost"
        });
    }

    async run(member: GuildMember) {
        if (member.user.bot) return;

        const { database, util } = this.container;

        const { guild } = member;
        const db = await database.guilds.fetch(guild.id);
        if (!db || !db.logs.channel || !db.logs.types.memberUnboost) return;

        const channel = guild.channels.cache.get(db.logs.channel);
        if (!channel || !channel.isTextBased()) return;

        if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
            return;

        const embed = util
            .embed()
            .setAuthor({
                name: `${guild.name} Member Logs`,
                iconURL: guild.iconURL() as string
            })
            .setTitle(
                `${member.user.username} Removed the boost from the server`
            )
            .setThumbnail(member.displayAvatarURL());

        return channel.send({ embeds: [embed] });
    }
}
