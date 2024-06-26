import { createLogger, format, transports, config } from "winston";
import "winston-daily-rotate-file";
import "moment-timezone";
import { capitalize } from "lodash";
import moment from "moment";
import DiscordTransport from "winston-discord-transport";

const { combine, timestamp, printf, errors } = format;

const tsFormat = () =>
    moment().tz("America/Los_Angeles").format("YYYY-MM-DD hh:mm:ss A").trim();

const myFormat = printf(
    ({ level, message, timestamp }) =>
        `[${timestamp}] ${capitalize(level)}: ${message}`
);

const { NODE_ENV } = process.env;

const discordTransport = new DiscordTransport({
    webhook: process.env.LOGGING_WEBHOOK ?? "",
    defaultMeta: {},
    level: "error"
});

const rotateOpts = {
    datePattern: "YYYY-MM-DD-HH",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d"
};

const logger = createLogger({
    levels: config.syslog.levels,
    level: NODE_ENV === "development" ? "debug" : "info",
    format: combine(
        timestamp({
            format: tsFormat
        }),
        errors({ stack: true }),
        myFormat
    ),
    rejectionHandlers: [
        new transports.Console(),
        new transports.DailyRotateFile({
            filename: "logs/rejections-%DATE%.log",
            ...rotateOpts
        }),
        discordTransport
    ],
    exceptionHandlers: [
        new transports.Console(),
        new transports.DailyRotateFile({
            filename: "logs/exceptions-%DATE%.log",
            ...rotateOpts
        }),
        discordTransport
    ],
    transports: [
        new transports.DailyRotateFile({
            filename: "logs/errors-%DATE%.log",
            level: "error",
            ...rotateOpts
        }),
        new transports.DailyRotateFile({
            filename: "logs/debug-%DATE%.log",
            level: "debug",
            ...rotateOpts
        }),
        new transports.DailyRotateFile({
            filename: "logs/all-%DATE%.log",
            ...rotateOpts
        }),
        new transports.Console({
            format: format.colorize({ all: true })
        }),
        discordTransport
    ]
});

export default logger;
