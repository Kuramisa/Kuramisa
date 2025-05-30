import dayjs from "dayjs";
import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    CDN,
    Message,
    type InteractionResponse,
    type SlashCommandBuilder,
    type SlashCommandSubcommandBuilder,
} from "discord.js";

import "dayjs/plugin/duration";
import Nekos from "nekos.life";
import { convert } from "owospeak";

import { sleep } from "@sapphire/utilities";
import random from "lodash/random";
import type { SlashCommandOption } from "typings";
import { memberActions, statusColor, statusEmoji, statusText } from "./Member";
import Pagination from "./Pagination";

export const cdn = new CDN();
export const nekos = new Nekos();

export const urlPattern =
    /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+~#?&/=]*)/;

export const durationPattern = /^[0-5]?\d(:[0-5]\d){1,2}$/;

export const validateHex = (hex: string) =>
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

export const containsUrl = (str: string) => urlPattern.test(str);
export const extractUrls = (str: string) => RegExp(urlPattern).exec(str);

export const addOption = (
    builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
    option: SlashCommandOption,
) => {
    switch (option.type) {
        case ApplicationCommandOptionType.Boolean:
            builder.addBooleanOption(option);
            break;
        case ApplicationCommandOptionType.Attachment:
            builder.addAttachmentOption(option);
            break;
        case ApplicationCommandOptionType.String:
            builder.addStringOption(option);
            break;
        case ApplicationCommandOptionType.Integer:
            builder.addIntegerOption(option);
            break;
        case ApplicationCommandOptionType.User:
            builder.addUserOption(option);
            break;
        case ApplicationCommandOptionType.Channel:
            builder.addChannelOption(option);
            break;
        case ApplicationCommandOptionType.Role:
            builder.addRoleOption(option);
            break;
        case ApplicationCommandOptionType.Mentionable:
            builder.addMentionableOption(option);
            break;
        case ApplicationCommandOptionType.Number:
            builder.addNumberOption(option);
            break;
    }
};

export const owoify = (text: string) =>
    convert(text, {
        tilde: random(0, 1, false) === 0,
        stutter: random(0, 1, false) === 0,
    });

export const commandType = (
    type?:
        | ApplicationCommandType.ChatInput
        | ApplicationCommandType.User
        | ApplicationCommandType.Message,
) => {
    switch (type) {
        case ApplicationCommandType.ChatInput:
            return "Slash Command";
        case ApplicationCommandType.User:
            return "User Context Menu";
        case ApplicationCommandType.Message:
            return "Message Context Menu";
        default:
            return "Slash Command";
    }
};

export const optionType = (
    type?:
        | ApplicationCommandOptionType.Attachment
        | ApplicationCommandOptionType.Boolean
        | ApplicationCommandOptionType.Channel
        | ApplicationCommandOptionType.Integer
        | ApplicationCommandOptionType.Mentionable
        | ApplicationCommandOptionType.Number
        | ApplicationCommandOptionType.Role
        | ApplicationCommandOptionType.String
        | ApplicationCommandOptionType.User,
) => {
    switch (type) {
        case ApplicationCommandOptionType.Attachment:
            return "Attachment";
        case ApplicationCommandOptionType.Boolean:
            return "Boolean (true = yes/false = no)";
        case ApplicationCommandOptionType.Channel:
            return "Channel";
        case ApplicationCommandOptionType.Integer:
            return "Number (non-decimals)";
        case ApplicationCommandOptionType.Mentionable:
            return "Mentionable (user/role/channel)";
        case ApplicationCommandOptionType.Number:
            return "Number (including decimals)";
        case ApplicationCommandOptionType.Role:
            return "Role";
        case ApplicationCommandOptionType.User:
            return "User";
        case ApplicationCommandOptionType.String:
        default:
            return "Text";
    }
};

export const timedDelete = async (
    message: InteractionResponse | Message,
    time = 5000,
) => {
    if (message instanceof Message && !message.deletable) return;
    await sleep(time);
    message.delete().catch(() => null);
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
            index % 2 === 0 ? word.toLowerCase() : word.toUpperCase(),
        )
        .join("");

export const formatNumber = (
    num: string | number,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
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

export { memberActions, Pagination, statusColor, statusEmoji, statusText };
