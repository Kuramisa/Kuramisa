import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    InteractionContextType,
    type MessageApplicationCommandData,
    type MessageContextMenuCommandInteraction,
    PermissionsBitField,
} from "discord.js";

import type { Command } from "@sapphire/framework";
import {
    AbstractCommand,
    type ICommand,
    type ICommandOptions,
} from "./Command";

export interface IMessageMenuCommand extends ICommand {
    type: ApplicationCommandType.Message;
}

export abstract class AbstractMessageMenuCommand
    extends AbstractCommand
    implements IMessageMenuCommand
{
    readonly type: ApplicationCommandType.Message;

    readonly data: ContextMenuCommandBuilder;

    constructor(context: Command.LoaderContext, options: ICommandOptions) {
        super(context, { ...options });

        this.type = ApplicationCommandType.Message;

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
            this.data.toJSON() as MessageApplicationCommandData,
        );
    }

    abstract run(interaction: MessageContextMenuCommandInteraction): unknown;
}

export function MessageMenuCommand(options: ICommandOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractMessageMenuCommand) {
        return class extends target {
            constructor(context: Command.LoaderContext) {
                super(context, {
                    ...options,
                });
                target.prototype.run = target.prototype.run.bind(this);
            }

            run(interaction: MessageContextMenuCommandInteraction) {
                return target.prototype.run(interaction);
            }
        };
    } as any;
}
