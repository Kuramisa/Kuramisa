import { model, Schema, type InferSchemaType } from "mongoose";

export const guildSchema = new Schema({
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

export type IGuild = InferSchemaType<typeof guildSchema>;

const guildModel = model("guilds", guildSchema);

export type GuildDocument = ReturnType<(typeof guildModel)["hydrate"]>;

export default guildModel;
