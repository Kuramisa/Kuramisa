import { model, Schema } from "mongoose";

export interface IGuild extends IMongoResult<IGuild> {
    id: string;
    name: string;
    musicMessage: string;
    promoted: boolean;
    autorole: string[];
    dvc: {
        categoryId: string;
        parentId: string;
        id: string;
    }[];
    votePolls: {
        memberId: string;
        channelId: string;
        messageId: string;
        createdBy: string;
        duration: number;
        pollDuration: number;
        reason: string;
        voteType: VoteType;
    }[];
    logs: {
        channel?: string;
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

export const guild = new Schema<IGuild>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    musicMessage: String,
    autorole: [],
    dvc: [],
    promoted: {
        type: Boolean,
        default: false
    },
    votePolls: [
        {
            memberId: String,
            channelId: String,
            messageId: String,
            createdBy: String,
            duration: Number,
            pollDuration: Number,
            reason: String,
            voteType: String
        }
    ],
    logs: {
        channel: String,
        types: {
            memberWarned: Boolean,
            memberJoin: Boolean,
            memberLeave: Boolean,
            memberBoost: Boolean,
            memberUnboost: Boolean,
            memberRoleAdded: Boolean,
            memberRoleRemoved: Boolean,
            memberNicknameChange: Boolean,
            messageDeleted: Boolean,
            messageEdited: Boolean
        }
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
                            style: Number
                        }
                    ]
                }
            ]
        }
    ],
    filters: {
        message: {
            enabled: Boolean
        },
        media: {
            enabled: Boolean
        }
    }
});

const guildModel = model<IGuild>("guilds", guild);

export type GuildDocument = ReturnType<(typeof guildModel)["hydrate"]>;

export default guildModel;
