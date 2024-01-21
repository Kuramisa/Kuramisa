import { container } from "@sapphire/pieces";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { GuildMember, Message, TextInputStyle } from "discord.js";

export default class Reports {
    async create(member: GuildMember, by: GuildMember, reason: string) {
        const { database, util } = container;

        const { guild } = member;

        const dbUser = await database.users.fetch(member.user.id);
        const dbGuild = await database.guilds.fetch(guild.id);

        if (!dbUser || !dbGuild) return;

        dbUser.reports.push({
            id: `report-${DiscordSnowflake.generate()}`,
            guildId: guild.id,
            by: by.id,
            reason,
            timestamp: Date.now(),
        });

        await dbUser.save();

        if (dbGuild.logs.types.memberReported) {
            const channel = guild.channels.cache.get(dbGuild.logs.channel);
            if (!channel || !channel.isTextBased()) return;

            if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
                return;

            const embed = util
                .embed()
                .setAuthor({
                    name: `${guild.name} Logs`,
                    iconURL: guild.iconURL({ extension: "gif" }) as string,
                })
                .setThumbnail(member.displayAvatarURL({ extension: "gif" }))
                .setDescription(`${by} **Reported** ${member}`)
                .addFields({ name: "Reason", value: reason });

            channel.send({ embeds: [embed] });
        }
    }

    async createMessageReport(
        member: GuildMember,
        by: GuildMember,
        message: Message,
        reason: string
    ) {
        const { database, util } = container;

        const { guild } = member;

        const dbUser = await database.users.fetch(member.user.id);
        const dbGuild = await database.guilds.fetch(guild.id);

        if (!dbUser || !dbGuild || !message.guild) return;

        dbUser.reports.push({
            id: `report-${DiscordSnowflake.generate()}`,
            guildId: guild.id,
            by: by.id,
            message: { id: message.id, content: message.content },
            reason,
            timestamp: Date.now(),
        });

        await dbUser.save();

        if (dbGuild.logs.types.memberReported) {
            const channel = guild.channels.cache.get(dbGuild.logs.channel);
            if (!channel || !channel.isTextBased()) return;

            if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
                return;

            const embed = util
                .embed()
                .setAuthor({
                    name: `${guild.name} Logs`,
                    iconURL: guild.iconURL({ extension: "gif" }) as string,
                })
                .setThumbnail(member.displayAvatarURL({ extension: "gif" }))
                .setDescription(
                    `${by} **Reported** ${member}'s Message\n\n[Message Link](https://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`
                )
                .addFields({ name: "Reason", value: reason });

            channel.send({ embeds: [embed] });
        }
    }

    async get(member: GuildMember) {
        const { database } = container;

        const db = await database.users.fetch(member.user.id);

        return db.reports.filter(
            (report) => report.guildId === member.guild.id
        );
    }

    async clear(member: GuildMember) {
        const { database } = container;

        const db = await database.users.fetch(member.user.id);

        db.reports = db.reports.filter(
            (report) => report.guildId !== member.guild.id
        );

        await db.save();
    }

    async remove(id: string, member: GuildMember) {
        const { database } = container;

        const db = await database.users.fetch(member.user.id);

        db.reports = db.reports.filter((report) => report.id !== id);

        await db.save();
    }

    total = async (member: GuildMember) => (await this.get(member))?.length;

    modal = (member: GuildMember) =>
        container.util
            .modal()
            .setCustomId(`report_member_${member.id}`)
            .setTitle(`Reporting ${member.user.username}`)
            .setComponents(
                container.util
                    .modalRow()
                    .setComponents(
                        container.util
                            .input()
                            .setCustomId("report_reason")
                            .setLabel("Report Reason")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(4)
                            .setMaxLength(100)
                            .setPlaceholder("Type your reason here")
                            .setRequired(true)
                    )
            );

    messageModal = (member: GuildMember) =>
        container.util
            .modal()
            .setCustomId(`report_member_${member.id}_message`)
            .setTitle(`Reporting ${member.user.username}`)
            .setComponents(
                container.util
                    .modalRow()
                    .setComponents(
                        container.util
                            .input()
                            .setCustomId("report_reason")
                            .setLabel("Report Reason")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(4)
                            .setMaxLength(100)
                            .setPlaceholder("Type your reason here")
                            .setRequired(true)
                    )
            );
}
