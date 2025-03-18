import { AuthUserInfo } from "@valapi/auth";
import { model, Schema } from "mongoose";

export interface IUser {
    id: string;
    username: string;
    valorant?: {
        accounts: {
            json: AuthUserInfo;
            username: string;
        }[];
        wishlist: {
            uuid: string;
            type: "skin" | "buddy" | "card" | "spray" | "title";
        }[];
        notifications: {
            wishlist: boolean;
            daily: boolean;
            featured: boolean;
            nightMarket: boolean;
            accessory: boolean;
        };
    };
    playlists: Playlist[];
}

export const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
    username: {
        type: String,
        required: true,
    },
    valorant: {
        accounts: [
            {
                json: Object,
                username: String,
            },
        ],
        wishlist: [
            {
                uuid: String,
                type: String,
            },
        ],
        notifications: {
            wishlist: Boolean,
            daily: Boolean,
            featured: Boolean,
            nightMarket: Boolean,
            accessory: Boolean,
        },
    },
    playlists: [
        {
            id: String,
            name: String,
            thumbnail: String,
            tracks: [
                {
                    id: String,
                    title: String,
                    description: String,
                    author: String,
                    url: String,
                    thumbnail: String,
                    duration: Number,
                    durationMS: Number,
                    views: Number,
                },
            ],
        },
    ],
});

const userModel = model<IUser>("users", userSchema);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
