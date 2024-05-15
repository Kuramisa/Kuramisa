import kuramisa from "@kuramisa";
import { Collection, Snowflake, User } from "discord.js";
import DBUser from "@schemas/User";
import { merge } from "lodash";

export default class UserManager {
    readonly cache: Collection<string, KUser>;

    constructor() {
        this.cache = new Collection();
    }

    async create(user: User) {
        const { logger } = kuramisa;

        logger.info(
            `[User Manager] User added to the database (ID: ${user.id} - Username: ${user.username})`
        );

        const doc = await DBUser.create({
            id: user.id,
            username: user.username
        });

        const info: KUser = merge(user, doc._doc);

        if (!this.cache.has(user.id)) this.cache.set(user.id, info);

        return info;
    }

    get(id: Snowflake) {
        return this.cache.get(id) ?? this.fetch(id);
    }

    async fetch(id: Snowflake) {
        let user = kuramisa.users.cache.get(id);
        if (!user) user = await kuramisa.users.fetch(id);

        const doc = await DBUser.findOne({ id });
        if (!doc) return this.create(user);

        const info: KUser = merge(user, doc._doc);

        this.cache.set(id, info);

        return info;
    }
}
