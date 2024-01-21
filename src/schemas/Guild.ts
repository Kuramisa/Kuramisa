import { model, Schema } from "mongoose";
import type { MongoResult } from "../@types";

export interface IGuild extends MongoResult {
    id: string;
    name: string;
    prefix: string;
    musicMessage: string;
    promoted: boolean;
    autorole: string[];
    dvc: {
        categoryId: string;
        parentId: string;
        id: string;
    }[];
    polls: {
        messageId: string;
        channelId: string;
        buttons?: {
            customId: string;
            text: string;
            index: number;
            votes: {
                userId: string;
                votedAt: number;
            }[];
        }[];
        emojis?: {
            text: string;
            index: number;
        }[];
        type: "buttons" | "emojis";
        duration: number | null;
    }[];
    channels: {
        reports: string;
    };
    logs: {
        channel: string;
        types: {
            memberWarned: boolean;
            memberReported: boolean;
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
    };
    selfRoles: {
        channelId: string;
        messages: {
            id: string;
            buttons: {
                id: string;
                name: string;
                roleId: string;
                emoji?: string | null;
                style: number;
            }[];
        }[];
    }[];
    filters: {
        message: {
            enabled: boolean;
        };
        media: {
            enabled: boolean;
        };
    };
}

export const Guild = new Schema<IGuild>({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    musicMessage: String,
    autorole: [],
    dvc: [],
    polls: [],
    promoted: {
        type: Boolean,
        default: false,
    },
    logs: {
        channel: String,
        types: {
            memberWarned: Boolean,
            memberReported: Boolean,
            memberJoin: Boolean,
            memberLeave: Boolean,
            memberBoost: Boolean,
            memberUnboost: Boolean,
            memberRoleAdded: Boolean,
            memberRoleRemoved: Boolean,
            memberNicknameChange: Boolean,
            messageDeleted: Boolean,
            messageEdited: Boolean,
        },
    },
    selfRoles: [
        {
            channelId: String,
            messages: [
                {
                    id: String,
                    buttons: [
                        {
                            id: String,
                            name: String,
                            roleId: String,
                            emoji: String,
                            style: Number,
                        },
                    ],
                },
            ],
        },
    ],
    filters: {
        message: {
            enabled: Boolean,
        },
        media: {
            enabled: Boolean,
        },
    },
});

const GuildModel = model<IGuild>("guilds", Guild);

export type GuildDocument = ReturnType<(typeof GuildModel)["hydrate"]>;

export default GuildModel;
