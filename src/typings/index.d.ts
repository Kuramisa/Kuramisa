import type { AbstractSlashCommand } from "classes/SlashCommand";
import type { AbstractSlashSubcommand } from "classes/SlashSubcommand";
import type {
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "discord.js";
import { type AbstractMessageMenuCommand } from "../classes/MessageMenuCommand";
import { type AbstractUserMenuCommand } from "../classes/UserMenuCommand";

export interface Response<T> {
    status: number;
    data?: T;
    error?: string;
}

export type AllCommands =
    | AbstractSlashCommand
    | AbstractSlashSubcommand
    | AbstractMessageMenuCommand
    | AbstractUserMenuCommand;

export type SlashCommandOption =
    | SlashCommandAttachmentOption
    | SlashCommandChannelOption
    | SlashCommandBooleanOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption;
