import { container } from "@sapphire/pieces";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { GuildMember, TextInputStyle } from "discord.js";

export default class Warns {
    async create(member: GuildMember, by: GuildMember, reason: string) {
        const { database, util } = container;
        const { guild } = member;

        const dbUser = await database.users.fetch(member.user.id);
        const dbGuild = await database.guilds.fetch(guild.id);

        if (!dbUser || !dbGuild) return;

        dbUser.warns.push({
            id: `warn-${DiscordSnowflake.generate()}`,
            guildId: guild.id,
            by: by.id,
            reason,
            timestamp: Date.now()
        });

        await dbUser.save();

        if (dbGuild.logs.types.memberWarned) {
            const channel = guild.channels.cache.get(dbGuild.logs.channel);
            if (!channel || !channel.isTextBased()) return;
            if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
                return;

            const embed = util
                .embed()
                .setAuthor({
                    name: `${guild.name} Logs`,
                    iconURL: guild.iconURL() as string
                })
                .setThumbnail(member.displayAvatarURL({ extension: "gif" }))
                .setDescription(`${by} **Warned** ${member}`)
                .addFields({ name: "Reason", value: reason });

            channel.send({ embeds: [embed] });
        }
    }

    async get(member: GuildMember) {
        const { database } = container;

        const db = await database.users.fetch(member.user.id);

        return db.warns.filter((warn) => warn.guildId === member.guild.id);
    }

    async clear(member: GuildMember) {
        const { database } = container;

        const db = await database.users.fetch(member.user.id);

        db.warns = db.warns.filter((warn) => warn.guildId !== member.guild.id);

        await db.save();
    }

    async remove(id: string, member: GuildMember) {
        const { database } = container;

        const db = await database.users.fetch(member.user.id);

        db.warns = db.warns.filter((warn) => warn.id !== id);

        await db.save();
    }

    total = async (member: GuildMember) => (await this.get(member))?.length;

    modal = (member: GuildMember) =>
        container.util
            .modal()
            .setCustomId(`warn_member_${member.id}`)
            .setTitle(`Warning ${member.user.username}`)
            .setComponents(
                container.util
                    .modalRow()
                    .setComponents(
                        container.util
                            .input()
                            .setCustomId("warn_reason")
                            .setLabel("Warn Reason")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(4)
                            .setMaxLength(100)
                            .setPlaceholder("Type your reason here")
                            .setRequired(true)
                    )
            );
}
