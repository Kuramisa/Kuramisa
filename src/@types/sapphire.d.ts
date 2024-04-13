/* eslint-disable @typescript-eslint/naming-convention */
// Line above is important since we do not want to enforce naming conventions for sapphire pieces
import type Kuramisa from "../Kuramisa";
import type Database from "../struct/Database";
import type Moderation from "../struct/Moderation";
import type Kanvas from "../struct/Kanvas";
import type Games from "../struct/Games";
import type Systems from "../struct/Systems";
import type Util from "../struct/Util";
import type { Collection, Emoji, Guild, TextChannel, User } from "discord.js";
import type Dashboard from "../dashboard";

declare module "@sapphire/pieces" {
    interface Container {
        client: Kuramisa;

        initialized: boolean;

        supportServer: Guild;
        mainServer: Guild;

        botLogs: TextChannel | null;
        devReports: TextChannel | null;
        devSuggestions: TextChannel | null;
        promoteChannel: TextChannel | null;

        dashboard: Dashboard;

        staff: BotStaff[];
        owners: User[];

        database: Database;
        kanvas: Kanvas;
        moderation: Moderation;
        games: Games;
        systems: Systems;
        util: Util;

        emojis: Collection<string, Emoji>;
    }
}

declare module "@sapphire/framework" {
    interface Preconditions {
        OwnerOnly: never;
        BetaTesterOnly: never;
        InDevelopment: never;
        StaffOnly: never;
    }
}
