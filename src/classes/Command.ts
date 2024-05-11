import kuramisa from "@kuramisa";

export interface ICommand {
    readonly name: string;
    readonly description: string;
    readonly cooldown?: number;
    readonly ownerOnly?: boolean;
    readonly staffOnly?: boolean;
    readonly inDevelopment?: boolean;
    readonly betaTesterOnly?: boolean;
}

export interface ICommandOptions {
    name: string;
    description: string;
    cooldown?: number;
    ownerOnly?: boolean;
    staffOnly?: boolean;
    inDevelopment?: boolean;
    betaTesterOnly?: boolean;
    dmOnly?: boolean;
}

export abstract class AbstractCommand implements ICommand {
    readonly client = kuramisa;
    readonly logger = kuramisa.logger;

    readonly name: string;
    readonly description: string = "No description provided";
    readonly cooldown: number = 0;
    readonly ownerOnly?: boolean = false;
    readonly staffOnly?: boolean = false;
    readonly inDevelopment?: boolean = false;
    readonly betaTesterOnly?: boolean = false;
    readonly dmOnly?: boolean = false;

    constructor({
        name,
        description,
        cooldown,
        ownerOnly,
        staffOnly,
        inDevelopment,
        betaTesterOnly,
        dmOnly
    }: ICommandOptions) {
        if (!name) throw new Error("Command name must be provided.");
        this.name = name;
        this.description = description || this.description;
        this.cooldown = cooldown || this.cooldown;
        this.ownerOnly = ownerOnly || this.ownerOnly;
        this.staffOnly = staffOnly || this.staffOnly;
        this.inDevelopment = inDevelopment || this.inDevelopment;
        this.betaTesterOnly = betaTesterOnly || this.betaTesterOnly;
        this.dmOnly = dmOnly || this.dmOnly;
    }
}
