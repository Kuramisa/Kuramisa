import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    type ContextMenuCommandInteraction,
    type ContextMenuCommandType,
    InteractionContextType,
    type MessageContextMenuCommandInteraction,
    PermissionsBitField,
} from "discord.js";

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
    implements ICommandOptions
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
    }: ICommandOptions) {
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

        this.type = ApplicationCommandType.Message;

        this.data = new ContextMenuCommandBuilder()
            .setName(name)
            .setType(this.type);

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

export function MessageMenuCommand(options: ICommandOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractMessageMenuCommand) {
        return class extends target {
            constructor() {
                super(options);
                target.prototype.run = target.prototype.run.bind(this);
            }

            run(interaction: MessageContextMenuCommandInteraction) {
                return target.prototype.run(interaction);
            }
        };
    } as any;
}
