import { Schema, model } from "mongoose";
import type { Logs, SelfRoleChannel, VotePoll } from "typings";

export interface IGuild {
    id: string;
    name: string;
    autorole: string[];
    votePolls: VotePoll[];
    logs: Logs;
    selfRoles: SelfRoleChannel[];
}

export const guildSchema = new Schema<IGuild>({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    autorole: [],
    votePolls: [
        {
            memberId: String,
            channelId: String,
            messageId: String,
            createdBy: String,
            duration: Number,
            pollDuration: Number,
            reason: String,
            voteType: String,
        },
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
});

const guildModel = model<IGuild>("guilds", guildSchema);

export type GuildDocument = ReturnType<(typeof guildModel)["hydrate"]>;

export default guildModel;
