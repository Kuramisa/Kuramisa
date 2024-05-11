import logger from "struct/Logger";
import mongoose from "mongoose";

import DatabaseGuilds from "./Guilds";
import DatabaseUsers from "./Users";

const { DB } = process.env;

export default class KDatabase {
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
            .then(() => logger.info("[Database] Connected to database"))
            .catch((err) =>
                logger.error(`[Database] Error connecting to database: ${err}`)
            );
    disconnect = () =>
        this.connection
            .disconnect()
            .then(() => logger.info("[Database] Disconnected from database"))
            .catch((err) =>
                logger.error(
                    `[Database] Error disconnecting from database: ${err}`
                )
            );
}
