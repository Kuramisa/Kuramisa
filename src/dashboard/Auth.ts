import kuramisa from "@kuramisa";

import { Guild, PermissionsBitField } from "discord.js";

import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import DiscordOAuth2, { PartialGuild } from "discord-oauth2";
import { type Request } from "express";
import { cdn } from "@utils";
import { chunk } from "lodash";

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
            managers,
            systems: { crypt }
        } = kuramisa;

        const decoded = this.jwt.verify(crypt.decrypt(auth), this.secrets.jwt);

        const partialGuilds = await this.oauth.getUserGuilds(
            decoded.token.access_token
        );

        const guildsCache: ((PartialGuild | KGuild | Guild) & {
            botJoined: boolean;
        })[] = [];

        for (const partialGuild of partialGuilds) {
            if (!partialGuild.permissions) continue;
            if (
                !new PermissionsBitField(partialGuild.permissions as any).has(
                    "ManageGuild"
                )
            )
                continue;

            const guild: Guild | KGuild | null = db
                ? await managers.guilds.fetch(partialGuild.id).catch(() => null)
                : await kuramisa.guilds
                      .fetch(partialGuild.id)
                      .catch(() => null);

            if (!guild) {
                guildsCache.push({
                    botJoined: false,
                    ...partialGuild
                });

                continue;
            }

            guildsCache.push({
                botJoined: true,
                ...guild
            });
        }

        let guilds = [];

        if (perPage) guilds = chunk(guildsCache, perPage);
        else guilds = chunk(guildsCache, guildsCache.length);

        if (!guilds[page]) throw new GraphQLError("Page not found");

        return {
            data: guilds[page],
            count: guildsCache.length,
            page,
            perPage
        };
    }

    async checkToken(req: Request) {
        const {
            logger,
            systems: { crypt }
        } = kuramisa;

        const header = req.headers.authorization;
        if (!header) throw new Error("You must be logged in");
        const token = header.split("Bearer ")[1];
        if (!token)
            throw new Error("Authentication token must be 'Bearer [token]'");
        try {
            const jwtData = jwt.verify(crypt.decrypt(token), this.secrets.jwt);
            return await this.getUser(jwtData);
        } catch (err) {
            logger.error(err);
            throw new GraphQLError(
                "Session timed out, please refresh the page and login again"
            );
        }
    }

    async check({ headers: { authorization: header } }: Request) {
        const {
            logger,
            systems: { crypt }
        } = kuramisa;

        if (!header) return null;
        const token = header.split("Bearer ")[1];
        if (!token) return null;
        try {
            const jwtData = jwt.verify(crypt.decrypt(token), this.secrets.jwt);
            return await this.getUser(jwtData);
        } catch (err) {
            logger.error(err);
            return null;
        }
    }

    async generateToken(code: any) {
        const {
            logger,
            systems: { crypt }
        } = kuramisa;

        const decryptedCode = Buffer.from(code, "base64").toString("ascii");

        if (decryptedCode.includes("denied"))
            throw new GraphQLError("You declined the login request");

        try {
            const token = await this.oauth.tokenRequest({
                clientId: kuramisa.user?.id,
                clientSecret: this.secrets.client,

                code: decryptedCode,
                scope: ["identify", "guilds"],
                grantType: "authorization_code",
                redirectUri:
                    NODE_ENV === "development"
                        ? "http://localhost:5173/login"
                        : "https://kuramisa.com/login"
            });

            return crypt.encrypt(
                this.jwt.sign(
                    {
                        token
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
            database,
            logger,
            systems: { crypt }
        } = kuramisa;

        try {
            const decoded = this.jwt.verify(
                crypt.decrypt(auth),
                this.secrets.jwt
            );
            const user = await this.oauth.getUser(decoded.token.access_token);

            const avatarURL = user.avatar
                ? cdn.avatar(user.id, user.avatar)
                : cdn.defaultAvatar(0);

            const bannerURL = user.banner
                ? cdn.banner(user.id, user.banner, {
                      size: 2048
                  })
                : null;

            let info = { ...user, avatarURL, bannerURL };

            const userInClient = await kuramisa.users.fetch(user.id);
            if (userInClient) {
                const db = (
                    await database.users.fetch(userInClient.id)
                ).toJSON();

                if (db) {
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
