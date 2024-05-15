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

    readonly data: ContextMenuCommandBuilder = new ContextMenuCommandBuilder();

    constructor({
        name,
        description,
        cooldown,
        ownerOnly,
        staffOnly,
        inDevelopment,
        betaTesterOnly,
        type
    }: IMenuCommandOptions) {
        super({
            name,
            description,
            cooldown,
            ownerOnly,
            staffOnly,
            inDevelopment,
            betaTesterOnly
        });
        this.type = type;

        this.data
            .setName(this.name)
            .setType(this.type)
            .setDMPermission(!this.guildOnly);
    }

    abstract run(interaction: ContextMenuCommandInteraction): any;
}
