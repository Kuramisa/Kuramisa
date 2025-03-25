import type { Collection } from "discord.js";

import type Database from "../database";
import type Games from "../games";
import type Kanvas from "../kanvas";
import type Managers from "../managers";
import type Stores from "../stores";
import type Systems from "../systems";

declare module "discord.js" {
    export interface Client {
        initialized: boolean;
        startTime: number;

        readonly database: Database;

        readonly kanvas: Kanvas;
        readonly games: Games;
        readonly managers: Managers;
        readonly stores: Stores;
        readonly systems: Systems;

        readonly cooldowns: Collection<string, Collection<string, number>>;

        readonly kEmojis: Collection<string, ApplicationEmoji>;

        readonly owners: User[];

        getActivities(): PresenceData[];
        getActivity(): PresenceData;

        mentionCommand(
            command: string,
            extra?: {
                subcommand?: string;
                group?: string;
            },
        ): string;
    }
}
