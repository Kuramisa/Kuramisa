import { Collection, type Snowflake, type User } from "discord.js";
import type Kuramisa from "Kuramisa";
import logger from "Logger";
import type { UserDocument } from "models/User";
import userModel from "models/User";

export default class UserManager {
    private readonly client: Kuramisa;
    readonly cache: Collection<string, UserDocument>;

    constructor(client: Kuramisa) {
        this.container.client = client;
        this.cache = new Collection();
    }

    async create(user: User) {
        const doc = await userModel.create({
            id: user.id,
            username: user.username,
        });

        logger.info(
            `[User Manager] User added to the database (ID: ${user.id} - Username: ${user.username})`,
        );

        return doc;
    }

    get = (id: Snowflake) => this.cache.get(id) ?? this.fetch(id);

    async fetch(id: Snowflake) {
        const user =
            this.container.client.users.cache.get(id) ??
            (await this.container.client.users.fetch(id));
        const doc =
            (await userModel.findOne({
                id,
            })) ?? (await this.create(user));

        this.cache.set(id, doc);

        return doc;
    }
}
