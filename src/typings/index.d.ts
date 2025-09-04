import { type AbstractMessageMenuCommand } from "@classes/MessageMenuCommand";
import type { AbstractSlashCommand } from "@classes/SlashCommand";
import type { AbstractSlashSubcommand } from "@classes/SlashSubcommand";
import { type AbstractUserMenuCommand } from "@classes/UserMenuCommand";
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

export interface VotePoll {
    memberId: string;
    channelId: string;
    messageId: string;
    createdBy: string;
    duration: number;
    pollDuration: number;
    reason: string;
    voteType: string;
}

export interface Logs {
    channel: string;
    types: {
        memberWarned: boolean;
        memberJoin: boolean;
        memberLeave: boolean;
        memberBoost: boolean;
        memberUnboost: boolean;
        memberRoleAdded: boolean;
        memberRoleRemoved: boolean;
        memberNicknameChange: boolean;
        messageDeleted: boolean;
        messageEdited: boolean;
    };
}

export interface SelfRoleButton {
    id: string;
    name: string;
    roleId: string;
    emoji?: string | null;
    style: number;
}

export interface SelfRoleMessage {
    id: string;
    buttons: SelfRoleButton[];
}

export interface SelfRoleChannel {
    channelId: string;
    messages: SelfRoleMessage[];
}
