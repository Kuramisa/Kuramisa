import { container } from "@sapphire/framework";
import mongoose from "mongoose";

const { DATABASE } = process.env;

export default class Database {
    readonly connection: typeof mongoose;

    constructor() {
        this.connection = mongoose;
    }

    connect = () =>
        this.connection
            .connect(DATABASE ?? "")
            .then(() =>
                container.logger.info("[Database] Connected to database"),
            )
            .catch((error) =>
                container.logger.error(
                    `[Database] Error connecting to database: ${error}`,
                ),
            );
    disconnect = () =>
        this.connection
            .disconnect()
            .then(() =>
                container.logger.info("[Database] Disconnected from database"),
            )
            .catch((error) =>
                container.logger.error(
                    `[Database] Error disconnecting from database ${error}`,
                ),
            );
}
