import { AuthUserInfo } from "@valapi/auth";
import { model, Schema } from "mongoose";
import { IGuild } from "./Guild";

export interface IUser {
    id: string;
    username: string;
    valorant: {
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
});

const userModel = model<IGuild>("users", userSchema);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
