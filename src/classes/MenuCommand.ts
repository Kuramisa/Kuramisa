import {
    ContextMenuCommandBuilder,
    PermissionsBitField,
    type ContextMenuCommandInteraction,
    type ContextMenuCommandType,
} from "discord.js";
import {
    AbstractCommand,
    type ICommand,
    type ICommandOptions,
} from "./Command";

export interface IMenuCommand extends ICommand {
    type: ContextMenuCommandType;
}

export interface IMenuCommandOptions extends ICommandOptions {
    type: ContextMenuCommandType;
}

export abstract class AbstractMenuCommand
    extends AbstractCommand
    implements IMenuCommand
{
    readonly type: ContextMenuCommandType;

    readonly data: ContextMenuCommandBuilder;

    constructor({
        name,
        description,
        detailedDescription,
        cooldown,
        botPermissions,
        userPermissions,
        contexts,
        integrations,
        type,
    }: IMenuCommandOptions) {
        super({
            name,
            description,
            detailedDescription,
            cooldown,
            botPermissions,
            userPermissions,
            contexts,
            integrations,
        });

        this.type = type;

        this.data = new ContextMenuCommandBuilder()
            .setName(name)
            .setContexts(contexts)
            .setType(type);

        if (integrations) this.data.setIntegrationTypes(integrations);

        if (userPermissions)
            this.data.setDefaultMemberPermissions(
                new PermissionsBitField(userPermissions).bitfield
            );
    }

    abstract run(interaction: ContextMenuCommandInteraction): any;
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
