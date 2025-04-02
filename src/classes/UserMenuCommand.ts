import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    InteractionContextType,
    PermissionsBitField,
    type UserApplicationCommandData,
    type UserContextMenuCommandInteraction,
} from "discord.js";

import type { Command } from "@sapphire/framework";
import {
    AbstractCommand,
    type ICommand,
    type ICommandOptions,
} from "./Command";

export interface IUserMenuCommand extends ICommand {
    type: ApplicationCommandType.User;
}

export abstract class AbstractUserMenuCommand
    extends AbstractCommand
    implements IUserMenuCommand
{
    readonly type: ApplicationCommandType.User;

    readonly data: ContextMenuCommandBuilder;

    constructor(context: Command.LoaderContext, options: ICommandOptions) {
        super(context, { ...options });

        this.type = ApplicationCommandType.User;

        this.data = new ContextMenuCommandBuilder()
            .setName(this.name)
            .setType(this.type);

        if (options.integrations)
            this.data.setIntegrationTypes(options.integrations);
        else
            this.data.setIntegrationTypes(
                ApplicationIntegrationType.GuildInstall,
            );

        if (options.contexts) this.data.setContexts(options.contexts);
        else this.data.setContexts(InteractionContextType.Guild);

        if (options.requiredUserPermissions)
            this.data.setDefaultMemberPermissions(
                new PermissionsBitField(options.requiredUserPermissions)
                    .bitfield,
            );
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerContextMenuCommand(
            this.data.toJSON() as UserApplicationCommandData,
        );
    }

    abstract run(interaction: UserContextMenuCommandInteraction): unknown;
}

export function UserMenuCommand(options: ICommandOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractUserMenuCommand) {
        return class extends target {
            constructor(context: Command.LoaderContext) {
                super(context, { ...options });
                target.prototype.run = target.prototype.run.bind(this);
            }

            run(interaction: UserContextMenuCommandInteraction) {
                return target.prototype.run(interaction);
            }
        };
    } as any;
}
