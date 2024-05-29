import { model, Schema } from "mongoose";
import { type AuthCore } from "@valapi/auth";

export interface IUser extends IMongoResult<IUser> {
    id: string;
    username: string;
    betaTester: boolean;
    xp: number;
    level: number;
    valorant: {
        dashboardAuthorized: boolean;
        accounts: {
            json: AuthCore.Json;
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
        privacy: {
            wishlist: "public" | "friends" | "private";
            daily: "public" | "friends" | "private";
            nightMarket: "public" | "friends" | "private";
            accessory: "public" | "friends" | "private";
        };
    };
    botNotifications: {
        announcements: boolean;
        warns: boolean;
    };
    card: {
        background: {
            type: "banner" | "color" | "image" | "status";
            color: string;
            image: Buffer;
        };
        outlines: {
            type: "banner" | "avatar" | "color" | "status";
            color: string;
        };
        text: {
            type: "banner" | "avatar" | "color" | "status";
            color: string;
        };
    };
    warns: IWarn[];
}

export const user = new Schema<IUser>({
    id: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    betaTester: {
        type: Boolean,
        default: false
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    botNotifications: {
        announcements: {
            type: Boolean,
            default: true
        },
        warns: {
            type: Boolean,
            default: true
        }
    },
    valorant: {
        dashboardAuthorized: {
            type: Boolean,
            default: false
        },
        accounts: [],
        wishlist: [],
        notifications: {
            wishlist: {
                type: Boolean,
                default: false
            },
            daily: {
                type: Boolean,
                default: false
            },
            featured: {
                type: Boolean,
                default: false
            },
            nightMarket: {
                type: Boolean,
                default: false
            },
            accessory: {
                type: Boolean,
                default: false
            }
        },
        privacy: {
            wishlist: {
                type: String,
                default: "public"
            },
            daily: {
                type: String,
                default: "public"
            },
            nightMarket: {
                type: String,
                default: "public"
            },
            accessory: {
                type: String,
                default: "public"
            }
        }
    },
    card: {
        background: {
            type: {
                type: String,
                default: "color"
            },
            color: {
                type: String,
                default: "#121212"
            },
            image: Buffer
        },
        outlines: {
            type: {
                type: String,
                default: "status"
            },
            color: {
                type: String,
                default: "#222216"
            }
        },
        text: {
            type: {
                type: String,
                default: "color"
            },
            color: {
                type: String,
                default: "#ffffff"
            }
        }
    },
    warns: [
        {
            id: String,
            guildId: String,
            by: String,
            reason: String,
            createdTimestamp: Number,
            createdAt: Date
        }
    ]
});

const userModel = model<IUser>("users", user);

export type UserDocument = ReturnType<(typeof userModel)["hydrate"]>;

export default userModel;
