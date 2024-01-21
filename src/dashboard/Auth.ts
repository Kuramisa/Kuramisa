import { container } from "@sapphire/pieces";

import { PermissionsBitField } from "discord.js";

import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import DiscordOAuth2 from "discord-oauth2";
import { type Request } from "express";
import _ from "lodash";

const { JWT_SECRET, SECRET, NODE_ENV } = process.env;

export default class Auth {
    private readonly jwt: any;
    private readonly oauth: DiscordOAuth2;
    private readonly secrets: { client: string; jwt: string };

    constructor() {
        this.jwt = jwt;
        this.oauth = new DiscordOAuth2();
        this.secrets = { client: SECRET as string, jwt: JWT_SECRET as string };
    }

    async getUser(auth: any) {
        if (!auth) throw new GraphQLError("User not logged in");

        return await this.oauth.getUser(auth.token.access_token);
    }

    async getUserGuilds(
        auth: string,
        page: number,
        db?: boolean,
        perPage?: number
    ) {
        if (!auth) throw new GraphQLError("User not logged in");

        const {
            client,
            systems: { crypt },
            database,
            util,
        } = container;

        const decoded = this.jwt.verify(crypt.decrypt(auth), this.secrets.jwt);

        const partialGuilds = await this.oauth.getUserGuilds(
            decoded.token.access_token
        );

        const guildsCache = await Promise.all(
            partialGuilds
                .filter((g) =>
                    new PermissionsBitField(g.permissions as any).has(
                        "ManageGuild"
                    )
                )
                .map(async (g) => {
                    const guild = client.guilds.cache.get(g.id);
                    if (guild) return guild;
                    return client.guilds.fetch(g.id).catch(() => g);
                })
        );

        let guilds: any = await Promise.all(
            guildsCache.map(async (guild: any) => {
                const iconURL = guild.icon
                    ? util.cdn.icon(guild.id, guild.icon, {
                          extension: guild.icon.startsWith("a_")
                              ? "gif"
                              : "png",
                          size: 1024,
                      })
                    : "https://i.imgur.com/SCv8M69.png";

                const botJoined = client.guilds.cache.has(guild.id);

                let info = { iconURL, botJoined, ...guild };

                if (botJoined && db) {
                    const dbGuild = await database.guilds.fetch(guild.id);
                    if (dbGuild) info = { ...info, ...dbGuild };
                }

                return info;
            })
        );

        if (perPage) guilds = _.chunk(guilds, perPage);
        else guilds = _.chunk(guilds, guildsCache.length);

        if (!guilds[page]) throw new GraphQLError("Page not found");

        return {
            data: guilds[page],
            count: guildsCache.length,
            page,
            perPage,
        };
    }

    async checkToken(req: Request) {
        const {
            dashboard,
            logger,
            systems: { crypt },
        } = container;

        const header = req.headers.authorization;
        if (!header) throw new Error("You must be logged in");
        const token = header.split("Bearer ")[1];
        if (!token)
            throw new Error("Authentication token must be 'Bearer [token]'");
        try {
            const jwtData = jwt.verify(crypt.decrypt(token), this.secrets.jwt);
            return await dashboard.auth.getUser(jwtData);
        } catch (err) {
            logger.error(err);
            throw new GraphQLError(
                "Session timed out, please refresh the page and login again"
            );
        }
    }

    async check(req: Request) {
        const {
            dashboard,
            logger,
            systems: { crypt },
        } = container;

        const header = req.headers.authorization;
        if (!header) return null;
        const token = header.split("Bearer ")[1];
        if (!token) return null;
        try {
            const jwtData = jwt.verify(crypt.decrypt(token), this.secrets.jwt);
            return await dashboard.auth.getUser(jwtData);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async generateToken(code: any) {
        const {
            client,
            logger,
            systems: { crypt },
        } = container;

        const decryptedCode = Buffer.from(code, "base64").toString("ascii");

        if (decryptedCode.includes("denied"))
            throw new GraphQLError("You declined the login request");

        try {
            const token = await this.oauth.tokenRequest({
                clientId: client.user?.id,
                clientSecret: this.secrets.client,

                code: decryptedCode,
                scope: ["identify", "guilds"],
                grantType: "authorization_code",
                redirectUri:
                    NODE_ENV === "development"
                        ? "http://localhost:5173/login"
                        : "https://kuramisa.com/login",
            });

            return crypt.encrypt(
                this.jwt.sign(
                    {
                        token,
                    },
                    this.secrets.jwt
                )
            );
        } catch (err) {
            logger.error(err);
            throw new GraphQLError("Authentication failed, please try again");
        }
    }

    async authUser(auth: string) {
        if (!auth) throw new GraphQLError("Authentication data not provided");

        const {
            client,
            database,
            logger,
            systems: { crypt },
            util,
        } = container;

        try {
            const decoded = this.jwt.verify(
                crypt.decrypt(auth),
                this.secrets.jwt
            );
            const user = await this.oauth.getUser(decoded.token.access_token);

            const avatarURL = user.avatar
                ? util.cdn.avatar(user.id, user.avatar)
                : util.cdn.defaultAvatar(0);

            const bannerURL = user.banner
                ? util.cdn.banner(user.id, user.banner, {
                      size: 2048,
                  })
                : null;

            let info = { ...user, avatarURL, bannerURL };

            const userInClient = await client.users.fetch(user.id);
            if (userInClient) {
                const db = (
                    await database.users.fetch(userInClient.id)
                ).toJSON();

                if (db) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { card, valorant, ...dbInfo } = db;

                    info = { ...info, ...dbInfo };
                }
            }

            return info;
        } catch (err) {
            logger.error(err);
            throw new GraphQLError("Authentication failed, please try again");
        }
    }
}
