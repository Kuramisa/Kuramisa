import {
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
    ContextMenuCommandType
} from "discord.js";
import { AbstractCommand, ICommand, ICommandOptions } from "./Command";

export interface IMenuCommand extends ICommand {
    type: ContextMenuCommandType;
}

export interface IMenuCommandOptions extends ICommandOptions {
    type: ContextMenuCommandType;
}

export function MenuCommand(options: IMenuCommandOptions) {
    return function (target: typeof AbstractMenuCommand) {
        return class extends target {
            constructor() {
                super(options);
                target.prototype.run = target.prototype.run.bind(this);
            }

            run(interaction: ContextMenuCommandInteraction) {
                return target.prototype.run(interaction);
            }
        };
    };
}

export abstract class AbstractMenuCommand
    extends AbstractCommand
    implements IMenuCommand
{
    readonly type: ContextMenuCommandType;

    readonly data: ContextMenuCommandBuilder;

    constructor({ name, type }: IMenuCommandOptions) {
        super({ name });
        this.type = type;

        const builder = new ContextMenuCommandBuilder()
            .setName(this.name)
            .setType(this.type);

        this.data = builder;
    }

    abstract run(interaction: ContextMenuCommandInteraction): any;
}
