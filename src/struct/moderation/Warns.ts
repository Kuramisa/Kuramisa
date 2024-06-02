import kuramisa from "@kuramisa";
import { DiscordSnowflake } from "@sapphire/snowflake";
import { type GuildMember, TextInputStyle, Guild } from "discord.js";

import { KEmbed, KModal, KModalRow, KTextInput } from "@builders";
import { mentionCommand } from "@utils";

export default class Warns {
    async create(
        guild: Guild,
        member: GuildMember,
        by: GuildMember,
        reason: string
    ) {
        const { database } = kuramisa;

        const dbUser = await database.users.fetch(member.user.id);
        const dbGuild = await database.guilds.fetch(guild.id);

        if (!dbUser || !dbGuild) return;

        dbUser.warns.push({
            id: `warn-${DiscordSnowflake.generate()}`,
            guildId: guild.id,
            by: by.user.id,
            reason,
            createdTimestamp: Date.now(),
            createdAt: new Date()
        });

        await dbUser.save();

        if (dbGuild.logs.types.memberWarned) {
            const channel = guild.channels.cache.get(dbGuild.logs.channel);
            if (!channel) return;
            if (!channel.isTextBased()) return;
            if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
                return;

            const embed = new KEmbed()
                .setAuthor({
                    name: `${guild.name} Warn Logs`,
                    iconURL: guild.iconURL() ?? ""
                })
                .setThumbnail(member.avatarURL() ?? "")
                .setDescription(`${by} **Warned** ${member}`)
                .addFields({ name: "Reason", value: reason });

            channel.send({ embeds: [embed] });
        }

        if (dbUser.botNotifications.warns) {
            const embed = new KEmbed()
                .setAuthor({
                    name: guild.name,
                    iconURL: guild.iconURL() ?? ""
                })
                .setTitle("You have been warned")
                .setDescription(
                    `You can turn off this notification with ${mentionCommand("bot-notifications")}`
                )
                .setThumbnail(guild.iconURL() ?? "")
                .addFields({ name: "Reason", value: reason });

            member.send({
                embeds: [embed]
            });
        }
    }

    async get(member: GuildMember) {
        const { database } = kuramisa;

        const db = await database.users.fetch(member.user.id);

        return db.warns.filter((warn) => warn.guildId === member.guild.id);
    }

    async clear(member: GuildMember) {
        const { database } = kuramisa;

        const db = await database.users.fetch(member.user.id);

        db.warns = db.warns.filter((warn) => warn.guildId !== member.guild.id);

        await db.save();
    }

    async remove(id: string, member: GuildMember) {
        const { database } = kuramisa;

        const db = await database.users.fetch(member.user.id);

        db.warns = db.warns.filter((warn) => warn.id !== id);

        await db.save();
    }

    total = async (member: GuildMember) => (await this.get(member))?.length;

    modal = (member: GuildMember) =>
        new KModal()
            .setCustomId(`warn_member_${member.id}`)
            .setTitle(`Warning ${member.user.username}`)
            .setComponents(
                new KModalRow().setComponents(
                    new KTextInput()
                        .setCustomId("warn_reason")
                        .setLabel("Warn Reason")
                        .setStyle(TextInputStyle.Short)
                        .setMinLength(4)
                        .setMaxLength(100)
                        .setPlaceholder("Type your reason here")
                )
            );
}
