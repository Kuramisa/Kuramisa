import logger from "Logger";
import mongoose from "mongoose";

const { DB } = process.env;

export default class KDatabase {
    connection: typeof mongoose;

    constructor() {
        this.connection = mongoose;
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
