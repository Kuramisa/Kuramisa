import kuramisa from "@kuramisa";
import { Collection, type Snowflake, type User } from "discord.js";

import logger from "Logger";
import type { UserDocument } from "models/User";
import userModel from "models/User";

export default class UserManager {
    readonly cache: Collection<string, UserDocument>;

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

        return doc;
    }

    get = (id: Snowflake) => this.cache.get(id) ?? this.fetch(id);

    async fetch(id: Snowflake) {
        const user =
            kuramisa.users.cache.get(id) ?? (await kuramisa.users.fetch(id));
        const doc =
            (await userModel.findOne({
                id,
            })) ?? (await this.create(user));

        this.cache.set(id, doc);

        return doc;
    }
}
