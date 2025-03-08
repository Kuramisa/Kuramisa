import kuramisa from "@kuramisa";
import logger from "../Logger";

import { CDN, Guild, InteractionResponse, Message } from "discord.js";

import crypto from "crypto";

import axios from "axios";
import dayjs from "dayjs";

import Nekos from "nekos.life";

import "dayjs/plugin/duration";

import { memberActions, statusColor, statusEmoji, statusText } from "./Member";
import Pagination from "./Pagination";
import { convert } from "owospeak";

export const cdn = new CDN();
export const nekos = new Nekos();

export const urlPattern =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+~#?&/=]*)/;

export const durationPattern = /^[0-5]?\d(:[0-5]\d){1,2}$/;

export const clearCommaneds = () => {
    kuramisa.application?.commands.set([]);

    logger.warn("Cleared all commands");
};

export const validateHex = (hex: string) =>
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

export const containsUrl = (str: string) => urlPattern.test(str);
export const extractUrls = (str: string) => RegExp(urlPattern).exec(str);

export const secureRandom = () => {
    const buffer = crypto.randomBytes(4);
    return buffer.readUInt32BE(0) / 0xffffffff;
};

export const owoify = (text: string) =>
    convert(text, {
        tilde: crypto.randomInt(1) === 0,
        stutter: crypto.randomInt(1) === 0,
    });

export const logsChannel = async (_guild: Guild) => {
    const { managers } = kuramisa;
    const guild = await managers.guilds.fetch(_guild.id);
    if (!guild.logs) return null;
    if (!guild.logs.channel) return null;
    let channel = guild.channels.cache.get(guild.logs.channel) ?? null;
    if (!channel)
        channel = (await guild.channels.fetch(guild.logs.channel)) ?? null;

    if (!channel) return null;
    if (!channel.isTextBased()) return null;
    if (!guild.members.me?.permissionsIn(channel).has("SendMessages"))
        return null;

    return channel;
};

export const randElement = <T>(array: T[]): T =>
    array[secureRandom() * array.length];

export const randEl = randElement;

export const imgToBuffer = async (url: string) =>
    (await axios.get(url, { responseType: "arraybuffer" })).data;

export const timedDelete = async (
    message: InteractionResponse | Message,
    time = 5000
) => {
    if (message instanceof Message && !message.deletable) return;
    setTimeout(() => message.delete(), time);
};

export const conj = (array: string[], conj = "and") => {
    if (array.length === 0) return "";
    if (array.length === 1) return array[0];
    return `${array.slice(0, -1).join(", ")} ${conj} ${array.slice(-1)}`;
};

export const mockText = (text: string) =>
    text
        .split("")
        .map((word, index) =>
            index % 2 === 0 ? word.toLowerCase() : word.toUpperCase()
        )
        .join("");

export const formatNumber = (
    num: string | number,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
) =>
    typeof num === "string"
        ? Number.parseFloat(num).toLocaleString(undefined, {
              minimumFractionDigits,
              maximumFractionDigits,
          })
        : num.toLocaleString(undefined, {
              minimumFractionDigits,
              maximumFractionDigits,
          });

export const durationToMs = (duration: string) =>
    duration.split(":").reduce((acc, time) => 60 * acc + +time, 0) * 1000;

export const namedUrl = (title: string, url: string) => `[${title}](${url})`;
export const embedUrl = (title: string, url: string, display?: string) =>
    `[${title}](${url.replace(/\)/g, "%29")}${display ?? ""})`;

export const daysToSeconds = (days: number) => days * 24 * 60 * 60;

export const formatTime = (time: number) => {
    const format = dayjs.duration(time).format("DD:HH:mm:ss");
    const chunks = format.split(":").filter((c) => c !== "00");

    if (chunks.length < 2) chunks.unshift("00");

    return chunks.join(":");
};

export const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
};

export const rgbToHex = (r: number, g: number, b: number) =>
    "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

export const changeShade = (hexColor: string, magnitude: number) => {
    hexColor = hexColor.replace(/^#/, "");
    if (hexColor.length === 6) {
        const decimalColor = parseInt(hexColor, 16);
        let r = (decimalColor >> 16) + magnitude;
        if (r > 255) r = 255;
        if (r < 0) r = 0;
        let g = (decimalColor & 0x0000ff) + magnitude;
        if (g > 255) g = 255;
        if (g < 0) g = 0;
        let b = ((decimalColor >> 8) & 0x00ff) + magnitude;
        if (b > 255) b = 255;
        if (b < 0) b = 0;
        return `#${(g | (b << 8) | (r << 16)).toString(16)}`;
    }

    return hexColor;
};

export const mentionCommand = (
    command: string,
    group?: string,
    subName?: string
) => {
    const commandId = kuramisa.application?.commands.cache.find(
        (c) => c.name === command
    )?.id;
    if (!commandId) {
        logger.error(`Couldn't mention ${command}, since it doesn't exist`);
        return "";
    }

    let commandLiteral = command;
    if (group) commandLiteral += `/${group}`;
    if (subName) commandLiteral += `/${subName}`;

    return `</${commandLiteral}:${commandId}>`;
};

export const imageToBuffer = async (url: string) =>
    (
        await axios.get(url, {
            responseType: "arraybuffer",
        })
    ).data;

export { memberActions, statusColor, statusEmoji, statusText, Pagination };
