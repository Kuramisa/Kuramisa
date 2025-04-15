import type { AbstractMessageMenuCommand } from "classes/MessageMenuCommand";
import type { AbstractSlashCommand } from "classes/SlashSubcommand";
import type { AbstractUserMenuCommand } from "classes/UserMenuCommand";
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

export interface Response<T> {
    status: number;
    data?: T;
    error?: string;
}

export type AbstractAllCommands =
    | AbstractSlashCommand
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
