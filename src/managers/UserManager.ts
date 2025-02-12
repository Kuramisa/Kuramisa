import kuramisa from "@kuramisa";
import { Collection, type Snowflake, type User } from "discord.js";
import merge from "lodash/merge";
import logger from "Logger";
import type { IUser } from "models/User";
import userModel from "models/User";

export default class UserManager {
    readonly cache: Collection<string, User & IUser>;

    constructor() {
        this.cache = new Collection();
    }

    async create(user: User) {
        const doc = await userModel.create({
            id: user.id,
            username: user.username,
        });

        logger.info(
            `[User Manager] User added to the database (ID: ${user.id} - Username: ${user.username})`
        );

        const info = merge(user, doc.toObject());

        if (!this.cache.has(user.id)) this.cache.set(user.id, info);

        return info;
    }

    get = (id: Snowflake) => this.cache.get(id) ?? this.fetch(id);

    async fetch(id: Snowflake) {
        let user = kuramisa.users.cache.get(id);
        if (!user) user = await kuramisa.users.fetch(id);

        const doc = await userModel.findOne({
            id,
        });

        if (!doc) return this.create(user);

        const info = merge(user, doc.toObject());

        this.cache.set(id, info);

        return info;
    }
}
