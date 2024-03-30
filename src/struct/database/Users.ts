import { container } from "@sapphire/framework";
import { Collection, User, type Snowflake } from "discord.js";

import DBUser, { type UserDocument } from "../../schemas/User";
import DBStaff from "../../schemas/Staff";

export default class DatabaseUsers {
    readonly cache: Collection<string, UserDocument>;

    constructor() {
        this.cache = new Collection();
    }

    async create(user: User) {
        const { logger } = container;

        logger.info(
            `User added to the database (ID: ${user.id} - Username: ${user.username})`
        );

        const doc = await DBUser.create({
            id: user.id,
            username: user.username
        });

        if (!this.cache.has(user.id)) this.cache.set(user.id, doc);

        return doc;
    }

    async fetch(userId: Snowflake) {
        let doc = await DBUser.findOne({ id: userId });

        if (!doc) {
            const {
                client: { users }
            } = container;

            let user = users.cache.get(userId);
            if (!user) user = await users.fetch(userId);

            doc = await this.create(user);
        }

        if (!this.cache.has(userId)) this.cache.set(userId, doc);

        return doc;
    }

    fetchStaff = () => DBStaff.find();

    fetchAll = () => DBUser.find();
}
