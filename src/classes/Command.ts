import kuramisa from "@kuramisa";
import {
    ApplicationIntegrationType,
    type InteractionContextType,
    type PermissionResolvable,
} from "discord.js";

import logger from "Logger";

export interface ICommand {
    readonly name: string;
    readonly description: string;
    readonly detailedDescription?: string;
    readonly cooldown: number;

    readonly botPermissions: PermissionResolvable[];
    readonly userPermissions: PermissionResolvable[];

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];
}

export interface ICommandOptions {
    name: string;
    description: string;
    contexts: InteractionContextType[];

    detailedDescription?: string;
    cooldown?: number;

    botPermissions?: PermissionResolvable[];
    userPermissions?: PermissionResolvable[];

    integrations?: ApplicationIntegrationType[];
}

export abstract class AbstractCommand implements ICommand {
    readonly client = kuramisa;
    readonly logger = logger;

    readonly name: string;
    readonly description: string = "No description provided.";
    readonly cooldown: number;
    readonly detailedDescription?: string;

    readonly botPermissions: PermissionResolvable[];
    readonly userPermissions: PermissionResolvable[];

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    constructor({
        name,
        description,
        detailedDescription,
        cooldown,
        botPermissions,
        userPermissions,
        contexts,
        integrations,
    }: ICommandOptions) {
        if (!name) throw new Error("No name provided");
        if (!contexts || contexts.length === 0)
            throw new Error("No contexts provided");
        this.name = name;
        this.description = description;
        this.detailedDescription = detailedDescription ?? undefined;
        this.cooldown = cooldown ?? 0;

        this.botPermissions = botPermissions ?? [];
        this.userPermissions = userPermissions ?? [];

        this.contexts = contexts ?? [];
        this.integrations = integrations ?? [
            ApplicationIntegrationType.GuildInstall,
        ];
    }
}
