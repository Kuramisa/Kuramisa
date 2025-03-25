import {
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    type ContextMenuCommandInteraction,
    type ContextMenuCommandType,
    InteractionContextType,
    PermissionsBitField,
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

        this.data = new ContextMenuCommandBuilder().setName(name).setType(type);

        if (integrations) this.data.setIntegrationTypes(integrations);
        else
            this.data.setIntegrationTypes(
                ApplicationIntegrationType.GuildInstall,
            );

        if (contexts) this.data.setContexts(contexts);
        else this.data.setContexts(InteractionContextType.Guild);

        if (userPermissions)
            this.data.setDefaultMemberPermissions(
                new PermissionsBitField(userPermissions).bitfield,
            );
    }

    abstract run(interaction: ContextMenuCommandInteraction): unknown;
}

export function MenuCommand(options: IMenuCommandOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
    } as any;
}
