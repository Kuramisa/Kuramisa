import mongoose from "mongoose";
import { container } from "@sapphire/framework";

import DatabaseGuilds from "./database/Guilds";
import DatabaseUsers from "./database/Users";

const { DB } = process.env;

export default class KuramisaDatabase {
    readonly connection: typeof mongoose;

    readonly guilds: DatabaseGuilds;
    readonly users: DatabaseUsers;

    constructor() {
        this.connection = mongoose;

        this.guilds = new DatabaseGuilds();
        this.users = new DatabaseUsers();
    }

    connect = () =>
        this.connection
            .connect(DB ?? "")
            .then(() => container.logger.info("Connected to the database"))
            .catch(container.logger.error);

    disconnect = () =>
        this.connection
            .disconnect()
            .then(() => container.logger.info("Disconnected from the database"))
            .catch(container.logger.error);
}
