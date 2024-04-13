import { container } from "@sapphire/pieces";
import { DiscordSnowflake } from "@sapphire/snowflake";
import Dashboard from "../../../dashboard";
import { GraphQLError } from "graphql";
import { type Request } from "express";
import { User } from "discord.js";

const server404 = "Server not found";
const member404 = "Member not found";

export default {
    Query: {
        user: async (
            _: any,
            { userId, fetchDb }: { userId: string; fetchDb?: boolean }
        ) => {
            const { client, database } = container;

            const user = await client.users.fetch(userId);
            if (!user) throw new GraphQLError("User not found");
            if (user.bot) throw new GraphQLError("User is a bot");

            const avatarURL = user.avatar
                ? user.avatarURL()
                : user.defaultAvatarURL;

            let info = { ...user, avatarURL };

            if (fetchDb) {
                const db = await database.users.fetch(user.id);
                const { valorant, ...rest } = db._doc;
                if (db) info = { ...db, ...rest };
            }

            return info;
        },
        users: async (
            _: any,
            {
                fetchDb,
                page = 0,
                perPage
            }: { fetchDb?: boolean; page: number; perPage?: number }
        ) => {
            const { client, database, util } = container;

            const usersCache = client.users.cache;

            const users = usersCache.filter((user) => !user.bot).toJSON();

            let usersPages: User[][] = [];

            if (perPage) usersPages = util.chunk(users, perPage);
            else usersPages = util.chunk(users, usersCache.size);

            if (!usersPages[page]) throw new GraphQLError("Page not found");

            const usersResolve = await Promise.all(
                usersPages[page].map(async (user: User) => {
                    const avatarURL = user.avatar
                        ? user.avatarURL()
                        : user.defaultAvatarURL;

                    let info = { ...user, avatarURL };

                    if (fetchDb) {
                        const db = await database.users.fetch(user.id);
                        const { valorant, ...rest } = db._doc;

                        if (db) info = { ...db, ...rest };
                    }

                    return info;
                })
            );

            return {
                data: usersResolve,
                count: usersCache.size,
                page,
                perPage
            };
        },

        userGuilds: async (
            _: any,
            {
                auth: authData,
                fetchDb,
                page = 0,
                perPage
            }: {
                auth: string;
                page: number;
                fetchDb?: boolean;
                perPage?: number;
            },
            { server: { auth } }: { server: Dashboard }
        ) => {
            return auth.getUserGuilds(authData, page, fetchDb, perPage);
        },

        warns: async (
            _: any,
            {
                guildId,
                userId,
                first,
                offset
            }: {
                guildId: string;
                userId: string;
                first?: number;
                offset?: number;
            }
        ) => {
            const { client, moderation } = container;

            const guild = await client.guilds.fetch(guildId);
            if (!guild) throw new GraphQLError(server404);

            const member = await guild.members.fetch(userId);
            if (!member) throw new GraphQLError(member404);

            return (await moderation.warns.get(member)).slice(first, offset);
        },
        login: async (
            _: any,
            { code }: { code: any },
            { server: { auth } }: { server: Dashboard }
        ) => {
            return auth.generateToken(code);
        }
    },
    Mutation: {
        warnUser: async (
            _: any,
            {
                guildId,
                userId,
                reason
            }: { guildId: string; userId: string; reason?: string },
            { req, server: { auth } }: { req: Request; server: Dashboard }
        ) => {
            const user = await auth.checkToken(req);

            const { client, database, util } = container;

            const guild = await client.guilds.fetch(guildId);
            if (!guild) throw new GraphQLError(server404);

            const warnedBy = await guild.members.fetch(user.id);
            if (!warnedBy) throw new GraphQLError(member404);

            if (!warnedBy.permissions.has("ModerateMembers"))
                throw new GraphQLError("Not enough permissions");

            const member = await guild.members.fetch(userId);
            if (!member) throw new GraphQLError(member404);

            const dbUser = await database.users.fetch(member.user.id);
            const dbGuild = await database.guilds.fetch(guild.id);

            if (!dbUser || !dbGuild)
                throw new GraphQLError("Database data is missing");

            if (!reason || reason.length < 1) reason = "No reason specified";

            const warn = {
                id: `warn-${DiscordSnowflake.generate()}`,
                guildId: guild.id,
                by: warnedBy.id,
                reason,
                createdTimestamp: Date.now(),
                createdAt: new Date()
            };

            dbUser.warns.push(warn);

            await dbUser.save();

            if (dbGuild.logs.types.memberWarned) {
                const channel = guild.channels.cache.get(dbGuild.logs.channel);
                if (!channel || !channel.isTextBased()) return;
                if (
                    !guild.members.me
                        ?.permissionsIn(channel)
                        .has("SendMessages")
                )
                    return;

                const embed = util
                    .embed()
                    .setAuthor({
                        name: `${guild.name} Logs`,
                        iconURL: guild.iconURL({
                            extension: "gif"
                        }) as string
                    })
                    .setThumbnail(member.displayAvatarURL({ extension: "gif" }))
                    .setDescription(`${warnedBy} **Warned** ${member}`)
                    .addFields({ name: "Reason", value: reason });

                channel.send({ embeds: [embed] });
            }

            return warn;
        },
        authUser: async (
            _: any,
            { auth: authData }: { auth: any },
            { server: { auth } }: { server: Dashboard }
        ) => {
            return auth.authUser(authData);
        }
    }
};
