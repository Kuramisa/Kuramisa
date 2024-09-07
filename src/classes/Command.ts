import kuramisa from "@kuramisa";
import {
    ApplicationIntegrationType,
    PermissionResolvable,
    RestOrArray
} from "discord.js";

export interface ICommand {
    readonly name: string;
    readonly description: string;
    readonly detailedDescription?: string;
    readonly cooldown?: number;
    readonly ownerOnly?: boolean;
    readonly staffOnly?: boolean;
    readonly inDevelopment?: boolean;
    readonly betaTesterOnly?: boolean;
    readonly guildOnly?: boolean;
    readonly botPermissions?: PermissionResolvable[];
    readonly userPermissions?: PermissionResolvable[];
}

export interface ICommandOptions {
    name: string;
    description: string;
    detailedDescription?: string;
    cooldown?: number;
    ownerOnly?: boolean;
    staffOnly?: boolean;
    inDevelopment?: boolean;
    betaTesterOnly?: boolean;
    guildOnly?: boolean;
    botPermissions?: PermissionResolvable[];
    userPermissions?: PermissionResolvable[];
    integrationTypes?: RestOrArray<ApplicationIntegrationType>;
}

export abstract class AbstractCommand implements ICommand {
    readonly client = kuramisa;
    readonly logger = kuramisa.logger;

    readonly name: string;
    readonly description: string = "No description provided";
    readonly detailedDescription?: string;
    readonly cooldown: number = 0;
    readonly ownerOnly?: boolean = false;
    readonly staffOnly?: boolean = false;
    readonly inDevelopment?: boolean = false;
    readonly betaTesterOnly?: boolean = false;
    readonly guildOnly?: boolean = false;

    readonly botPermissions: PermissionResolvable[] = [];
    readonly userPermissions: PermissionResolvable[] = [];

    readonly integrationTypes?: RestOrArray<ApplicationIntegrationType>;

    constructor({
        name,
        description,
        detailedDescription,
        cooldown,
        ownerOnly,
        staffOnly,
        inDevelopment,
        betaTesterOnly,
        guildOnly,
        botPermissions,
        userPermissions,
        integrationTypes
    }: ICommandOptions) {
        if (!name) throw new Error("Command name must be provided.");
        this.name = name;
        this.description = description || this.description;
        this.detailedDescription =
            detailedDescription || this.detailedDescription;
        this.cooldown = cooldown || this.cooldown;
        this.ownerOnly = ownerOnly || this.ownerOnly;
        this.staffOnly = staffOnly || this.staffOnly;
        this.inDevelopment = inDevelopment || this.inDevelopment;
        this.betaTesterOnly = betaTesterOnly || this.betaTesterOnly;
        this.guildOnly = guildOnly || this.guildOnly;

        this.botPermissions = botPermissions || this.botPermissions;
        this.userPermissions = userPermissions || this.userPermissions;
        this.integrationTypes = integrationTypes || this.integrationTypes;
    }
}
