export interface ICommand {
    readonly name: string;
}

export interface ICommandOptions {
    name: string;
}

export abstract class AbstractCommand implements ICommand {
    readonly name: string;

    constructor({ name }: ICommandOptions) {
        if (!name) throw new Error("Command name must be provided.");
        this.name = name;
    }
}
