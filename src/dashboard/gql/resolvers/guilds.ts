import { container } from "@sapphire/pieces";
import Dashboard from "../../../dashboard";
import { GraphQLError } from "graphql";
import { type Request } from "express";
import {
    BaseChannel,
    ChannelType,
    Guild,
    GuildMember,
    Invite
} from "discord.js";

const server404 = "Server not found";

export default {
    Query: {
        guild: async (
            _: any,
            { guildId, fetchDb }: { guildId: string; fetchDb?: boolean },
            { req, server: { auth } }: { req: Request; server: Dashboard }
        ) => {
            const { client, database, util } = container;

            const guild = await client.guilds.fetch(guildId).catch(() => {
                throw new GraphQLError(server404);
            });
            if (!guild) throw new GraphQLError(server404);

            const iconURL = guild.icon
                ? util.cdn.icon(guild.id, guild.icon, {
                      extension: guild.icon.startsWith("a_") ? "gif" : "png",
                      size: 1024
                  })
                : "https://i.imgur.com/SCv8M69.png";

            const json = guild.toJSON() as any;

            let info = { iconURL, ...json };

            if (fetchDb) {
                const db = await database.guilds.fetch(guild.id);

                if (db) {
                    info = { ...db, ...info };

                    if (
                        db.promoted &&
                        guild.members.me?.permissions.has("ManageGuild")
                    ) {
                        let invite = (await guild.invites.fetch())
                            .sort(
                                (a, b) =>
                                    (b.uses as number) - (a.uses as number)
                            )
                            .first();

                        if (!invite)
                            invite = await guild.invites.create(
                                guild.channels.cache
                                    .filter(
                                        (ch) =>
                                            ch.type === ChannelType.GuildText
                                    )
                                    .first() as any
                            );

                        info = { ...info, inviteURL: invite.url };
                    }
                }
            }

            const user = await auth.check(req);
            if (user) {
                const member = await guild.members
                    .fetch(user.id)
                    .catch(() => null);
                if (member) {
                    const authPerms = member.permissions.toArray();
                    info = { authPerms, ...info };
                }
            }

            return info;
        },
        guilds: async (
            _: any,
            {
                fetchDb,
                page = 0,
                perPage
            }: { fetchDb?: boolean; page: number; perPage?: number }
        ) => {
            const { client, database, util } = container;

            const guildsCache = client.guilds.cache;
            const guilds = guildsCache
                .toJSON()
                .sort((a, b) => b.memberCount - a.memberCount)
                .sort(
                    (a: any, b: any) => Number(b.promoted) - Number(a.promoted)
                );

            let guildsPages: Guild[][] = [];

            if (perPage) guildsPages = util.chunk(guilds, perPage);
            else guildsPages = util.chunk(guilds, guildsCache.size);

            if (!guildsPages[page]) throw new GraphQLError("Page not found");

            const guildsResolve = await Promise.all(
                guildsPages[page].map(async (guild: Guild) => {
                    const iconURL = guild.icon
                        ? util.cdn.icon(guild.id, guild.icon, {
                              extension: guild.icon.startsWith("a_")
                                  ? "gif"
                                  : "png",
                              size: 1024
                          })
                        : "https://i.imgur.com/SCv8M69.png";

                    let info = { iconURL, ...(guild.toJSON() as any) };

                    if (fetchDb) {
                        const db = await database.guilds.fetch(guild.id);
                        if (db) {
                            info = { ...db, ...info };

                            if (
                                db.promoted &&
                                guild.members.me?.permissions.has("ManageGuild")
                            ) {
                                let invite = (await guild.invites.fetch())
                                    .sort(
                                        (a: Invite, b: Invite) =>
                                            (b.uses as number) -
                                            (a.uses as number)
                                    )
                                    .first();

                                if (!invite)
                                    invite = await guild.invites.create(
                                        guild.channels.cache
                                            .filter(
                                                (ch: BaseChannel) =>
                                                    ch.type ===
                                                    ChannelType.GuildText
                                            )
                                            .first() as any
                                    );

                                info = {
                                    ...info,
                                    inviteURL: invite.url
                                };
                            }
                        }
                    }

                    return info;
                })
            );

            return {
                data: guildsResolve,
                count: guildsCache.size,
                page,
                perPage
            };
        },

        member: async (
            _: any,
            {
                guildId,
                memberId,
                fetchDb
            }: { guildId: string; memberId: string; fetchDb?: boolean }
        ) => {
            const { client, database, util } = container;

            const guild = await client.guilds.fetch(guildId);
            if (!guild) throw new GraphQLError(server404);

            const member = await guild.members.fetch(memberId);
            if (!member) throw new GraphQLError("Member not found");
            if (member.user.bot) throw new GraphQLError("Member is a bot");

            const avatarURL = member.user.avatar
                ? util.cdn.avatar(member.id, member.user.avatar)
                : util.cdn.defaultAvatar(0);

            let info = {
                ...member,
                avatarURL
            };

            if (fetchDb) {
                const db = await database.users.fetch(member.user.id);
                if (db) info = { ...db, ...info };
            }

            return info;
        },
        members: async (
            _: any,
            {
                guildId,
                fetchDb,
                page = 0,
                perPage
            }: {
                guildId: string;
                fetchDb?: boolean;
                page: number;
                perPage?: number;
            }
        ) => {
            const { client, database, util } = container;

            const guild = await client.guilds.fetch(guildId);
            if (!guild) throw new GraphQLError(server404);

            const membersCache = guild.members.cache.filter(
                (member) => !member.user.bot
            );

            const members = membersCache.toJSON();

            let memberPages: GuildMember[][] = [];

            if (perPage) memberPages = util.chunk(members, perPage);
            else memberPages = util.chunk(members, membersCache.size);

            if (!memberPages[page]) throw new GraphQLError("Page not found");

            const membersResolve = await Promise.all(
                memberPages[page].map(async (member: GuildMember) => {
                    const avatarURL = member.user.avatar
                        ? util.cdn.avatar(member.id, member.user.avatar)
                        : util.cdn.defaultAvatar(0);

                    let info = { ...member, avatarURL };

                    if (fetchDb) {
                        const db = await database.users.fetch(member.user.id);

                        if (db) info = { ...db, ...info };
                    }

                    return info;
                })
            );

            return {
                data: membersResolve,
                count: membersCache.size,
                page,
                perPage
            };
        },

        role: (
            _: any,
            { guildId, roleId }: { guildId: string; roleId: string }
        ) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError(server404);
            const role =
                guild.roles.cache.get(roleId) ??
                guild.roles.cache.find((role) => role.name === roleId);
            if (!role) throw new GraphQLError("Role not found");
            return role.toJSON();
        },
        roles: (_: any, { guildId }: { guildId: string }) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError(server404);
            return guild.roles.cache.toJSON();
        },

        emoji: (
            _: any,
            {
                guildId,
                emojiId
            }: {
                guildId: string;
                emojiId: string;
            }
        ) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError(server404);
            const emoji =
                guild.emojis.cache.get(emojiId) ??
                guild.emojis.cache.find((emoji) => emoji.name === emojiId);
            if (!emoji) throw new GraphQLError("Emoji not found");
            return emoji.toJSON();
        },
        emojis: (_: any, { guildId }: { guildId: string }) => {
            const guild = container.client.guilds.cache.get(guildId);
            if (!guild) throw new GraphQLError(server404);
            return guild.emojis.cache.toJSON();
        }
    }
};
