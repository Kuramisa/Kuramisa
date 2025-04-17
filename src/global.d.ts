import type {
    ApplicationIntegrationType,
    Collection,
    InteractionContextType,
} from "discord.js";

import type { SlashCommandOption } from "typings";
import type Database from "./database";
import type Games from "./games";
import type Kanvas from "./kanvas";
import type Managers from "./managers";
import type Systems from "./systems";

declare module "discord.js" {
    export interface Client {
        initialized: boolean;
        startTime: number;

        readonly database: Database;

        readonly kanvas: Kanvas;
        readonly games: Games;
        readonly managers: Managers;
        readonly systems: Systems;

        readonly cooldowns: Collection<string, Collection<string, number>>;

        readonly kEmojis: Collection<string, ApplicationEmoji>;

        readonly owners: Collection<string, User>;

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

declare module "@sapphire/plugin-subcommands" {
    export interface SubcommandMappingMethod {
        description: string;
        opts?: SlashCommandOption[];
    }

    export interface SubcommandMappingGroup {
        description: string;
    }
}

declare module "@sapphire/framework" {
    export interface CommandOptions {
        contexts?: InteractionContextType[];
        integrations?: ApplicationIntegrationType[];
        opts?: SlashCommandOption[];
    }

    export interface ListenerOptions {
        description: string;
    }
}
