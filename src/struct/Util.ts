import Nekos from "nekos.life";
import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    CDN,
    ChannelSelectMenuBuilder,
    EmbedBuilder,
    InteractionResponse,
    MentionableSelectMenuBuilder,
    Message,
    ModalBuilder,
    RoleSelectMenuBuilder,
    StringSelectMenuBuilder,
    TextInputBuilder,
    UserSelectMenuBuilder,
    type MessageActionRowComponentBuilder,
    type ModalActionRowComponentBuilder
} from "discord.js";
import { container } from "@sapphire/framework";
import axios from "axios";
import moment from "moment";
import JAPIRest from "japi.rest.ts";

import UtilMember from "./util/Member";
import UtilPagination from "./util/Pagination";

type MenuType = "string" | "role" | "mentionable" | "user" | "channel";

const { JAPI_KEY } = process.env;

export default class KUtil {
    readonly cdn: CDN;
    readonly nekos: Nekos;

    readonly member: UtilMember;
    readonly japi: JAPIRest;
    readonly pagination: UtilPagination;

    readonly urlPattern = new RegExp(
        "([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?"
    );

    constructor() {
        this.cdn = new CDN();
        this.japi = new JAPIRest(JAPI_KEY ?? "");
        this.nekos = new Nekos();

        this.member = new UtilMember();
        this.pagination = new UtilPagination();
    }

    abbrev(num: any) {
        if (!num || isNaN(num)) return 0;
        if (typeof num === "string") num = parseInt(num);
        const decPlaces = Math.pow(10, 1);

        const abbrev = ["K", "M", "B", "T"];
        for (let i = abbrev.length - 1; i >= 0; i--) {
            const size = Math.pow(10, (i + 1) * 3);
            if (size <= num) {
                num = Math.round((num * decPlaces) / size) / decPlaces;
                if (num === 1000 && i < abbrev.length - 1) {
                    num = 1;
                    i++;
                }
                num += abbrev[i];
                break;
            }
        }
        return num;
    }

    chunk(arr: any, size: number) {
        const temp = [];
        for (let i = 0; i < arr.length; i += size) {
            temp.push(arr.slice(i, i + size));
        }

        return temp;
    }

    async clearCommands() {
        const { client, logger } = container;

        await client.application?.commands.set([]);

        logger.warn("Commands cleared");
    }

    validateHex = (hex: string) =>
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);

    containsUrl = (url: string) => this.urlPattern.test(url);
    extractUrl = (url: string) => this.urlPattern.exec(url)?.[0];

    daysToSeconds = (days: number) => days * 24 * 60 * 60;

    // Predefined Builders
    embed = () => new EmbedBuilder().setTimestamp(new Date());
    row = () => new ActionRowBuilder<MessageActionRowComponentBuilder>();
    modalRow = () => new ActionRowBuilder<ModalActionRowComponentBuilder>();
    button = () => new ButtonBuilder();

    stringMenu = () => new StringSelectMenuBuilder();

    menu(type?: MenuType) {
        switch (type) {
            case "channel":
                return new ChannelSelectMenuBuilder();
            case "mentionable":
                return new MentionableSelectMenuBuilder();
            case "user":
                return new UserSelectMenuBuilder();
            case "role":
                return new RoleSelectMenuBuilder();
            default:
                return new StringSelectMenuBuilder();
        }
    }

    modal = () => new ModalBuilder();
    input = () => new TextInputBuilder();

    randEl = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
    randomElement = (arr: any[]) => this.randEl(arr);

    durationMs = (dur: string) =>
        dur
            .split(":")
            .map(Number)
            .reduce((acc, curr) => curr + acc * 60) * 1000;

    msToDur = (ms: number) => moment(ms).format("h:mm:ss");

    formatNumber = (
        num: string | number,
        minimumFractionDigits = 0,
        maximumFractionDigits = 2
    ) =>
        typeof num === "string"
            ? Number.parseFloat(num).toLocaleString(undefined, {
                  minimumFractionDigits,
                  maximumFractionDigits
              })
            : num.toLocaleString(undefined, {
                  minimumFractionDigits,
                  maximumFractionDigits
              });

    imageToBuffer = async (url: string) =>
        (
            await axios.get(url, {
                responseType: "arraybuffer"
            })
        ).data;

    async removeNonexistentCommands() {
        const { client, stores } = container;

        const commands = await client.application?.commands.fetch();
        const deletedCommands: string[] = [];
        if (!commands) return deletedCommands;

        const commandStore = stores.get("commands");

        commands.forEach(async (command) => {
            if (
                command.type === ApplicationCommandType.Message ||
                command.type === ApplicationCommandType.User
            )
                return;
            if (!commandStore.has(command.name)) {
                command.delete();
                deletedCommands.push(`${command.name} (Slash Command)`);
            }
        });

        return deletedCommands;
    }

    static async timedDelete(
        message: InteractionResponse | Message,
        time = 5000
    ) {
        if (message instanceof Message && !message.deletable) return;
        setTimeout(() => message.delete(), time);
    }

    async timedDelete(message: InteractionResponse | Message, time = 5000) {
        if (message instanceof Message && !message.deletable) return;
        setTimeout(() => message.delete(), time);
    }

    conj(arr: string[], conj = "and") {
        const len = arr.length;
        if (len === 0) return "";
        if (len === 1) return arr[0];
        return `${arr.slice(0, -1).join(", ")}${
            len > 1 ? `${len > 2 ? "," : ""} ${conj} ` : ""
        }${arr.slice(-1)}`;
    }

    staffName = (staff: StaffType) => {
        switch (staff) {
            case "lead_developer":
                return "Lead Developer";
            case "developer":
                return "Developer";
            case "designer":
                return "Designer";
            case "bug_tester":
                return "Bug Tester";
            case "translator":
                return "Translator";
        }
    };

    shorten = (str: string, maxLen = 2000) =>
        str.length > maxLen ? `${str.substr(0, maxLen - 3)}...` : str;

    embedURL = (title: string, url: string, display?: string) =>
        `[${title}](${url.replace(/\)/g, "%29")}${
            display ? ` "${display}"` : ""
        })`;
}
