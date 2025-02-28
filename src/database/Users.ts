import kuramisa from "@kuramisa";

import { Collection, type User, type Snowflake } from "discord.js";
import logger from "Logger";

import DBUser, { type UserDocument } from "models/User";

export default class DatabaseUsers {
    readonly cache: Collection<string, UserDocument>;

    constructor() {
        this.cache = new Collection();
    }

    async create(user: User) {
        logger.info(
            `User added to the database (ID: ${user.id} - Username: ${user.username})`
        );

        const doc = await DBUser.create({
            id: user.id,
            username: user.username,
        });

        if (!this.cache.has(user.id)) this.cache.set(user.id, doc);

        return doc;
    }

    async fetch(userId: Snowflake) {
        let doc = await DBUser.findOne({ id: userId });

        if (!doc) {
            const { users } = kuramisa;

            let user = users.cache.get(userId);
            if (!user) user = await users.fetch(userId);

            doc = await this.create(user);
        }

        if (!this.cache.has(userId)) this.cache.set(userId, doc);

        return doc;
    }

    fetchAll = () => DBUser.find();
}
