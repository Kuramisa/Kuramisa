import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    InteractionContextType,
    PermissionsBitField,
    type UserContextMenuCommandInteraction,
} from "discord.js";

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

        this.type = ApplicationCommandType.User;

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

    abstract run(interaction: UserContextMenuCommandInteraction): unknown;
}

export function UserMenuCommand(options: ICommandOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractUserMenuCommand) {
        return class extends target {
            constructor() {
                super(options);
                target.prototype.run = target.prototype.run.bind(this);
            }

            run(interaction: UserContextMenuCommandInteraction) {
                return target.prototype.run(interaction);
            }
        };
    } as any;
}
