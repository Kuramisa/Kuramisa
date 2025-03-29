import {
    ApplicationIntegrationType,
    InteractionContextType,
    type PermissionResolvable,
} from "discord.js";

export interface ICommand {
    readonly name: string;
    readonly description: string;
    readonly detailedDescription?: string;
    readonly cooldown: number;

    readonly botPermissions?: PermissionResolvable[];
    readonly userPermissions?: PermissionResolvable[];

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    readonly ownerOnly: boolean;
}

export interface ICommandOptions {
    name: string;
    description: string;

    detailedDescription?: string;
    cooldown?: number;

    botPermissions?: PermissionResolvable[];
    userPermissions?: PermissionResolvable[];

    contexts?: InteractionContextType[];
    integrations?: ApplicationIntegrationType[];

    ownerOnly?: boolean;
}

export abstract class AbstractCommand implements ICommand {
    readonly name: string;
    readonly description: string = "No description provided.";
    readonly cooldown: number;
    readonly detailedDescription?: string;

    readonly botPermissions?: PermissionResolvable[];
    readonly userPermissions?: PermissionResolvable[];

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    readonly ownerOnly: boolean;

    constructor({
        name,
        description,
        detailedDescription,
        cooldown,
        botPermissions,
        userPermissions,
        contexts,
        integrations,
        ownerOnly,
    }: ICommandOptions) {
        this.name = name;
        this.description = description;
        this.detailedDescription = detailedDescription ?? undefined;
        this.cooldown = cooldown ?? 0;

        this.botPermissions = botPermissions ?? [];
        this.userPermissions = userPermissions ?? [];

        this.contexts = contexts ?? [InteractionContextType.Guild];
        this.integrations = integrations ?? [
            ApplicationIntegrationType.GuildInstall,
        ];

        this.ownerOnly = ownerOnly ?? false;
    }
}
