import type { Playlist } from "@typings/Music";
import type { AuthUserInfo } from "@valapi/auth";
import { Schema, model } from "mongoose";

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
            description: String,
            cover: {
                key: String,
                url: String,
            },
            tracks: [
                {
                    id: String,
                    title: String,
                    description: String,
                    author: String,
                    url: String,
                    thumbnail: String,
                    duration: String,
                    durationMS: Number,
                    views: Number,
                },
            ],
        },
    ],
});

const UserModel = model<IUser>("users", userSchema);

export type UserDocument = ReturnType<(typeof UserModel)["hydrate"]>;

export default UserModel;
