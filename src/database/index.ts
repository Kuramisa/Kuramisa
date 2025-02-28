import logger from "Logger";
import mongoose from "mongoose";

import DatabaseGuilds from "./Guilds";
import DatabaseUsers from "./Users";

const { DATABASE } = process.env;

export default class Database {
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
            .connect(DATABASE ?? "")
            .then(() => logger.info("[Database] Connected to database"))
            .catch((error) =>
                logger.error("[Database] Error connecting to database", {
                    error,
                })
            );
    disconnect = () =>
        this.connection
            .disconnect()
            .then(() => logger.info("[Database] Disconnected from database"))
            .catch((error) =>
                logger.error("[Database] Error disconnecting from database", {
                    error,
                })
            );
}
