import { Message } from "discord.js";

declare module "discord.js" {
    export interface Guild {
        musicMessage?: Message | null;
    }
}
