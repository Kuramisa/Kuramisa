import { Command } from "@sapphire/framework";
import {
    ApplicationCommandType,
    ApplicationIntegrationType,
    ContextMenuCommandBuilder,
    InteractionContextType,
} from "discord.js";

export class AbstractUserMenuCommand extends Command {
    readonly data: ContextMenuCommandBuilder;

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    readonly type = ApplicationCommandType.User;

    constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, options);

        this.data = new ContextMenuCommandBuilder()
            .setName(this.name)
            .setType(this.type);

        this.contexts = options.contexts ?? [InteractionContextType.Guild];
        this.integrations = options.integrations ?? [
            ApplicationIntegrationType.GuildInstall,
        ];
    }
}

export function UserMenuCommand(options: Command.Options) {
    return function <T extends new (...args: any[]) => AbstractUserMenuCommand>(
        Base: T,
    ): T {
        return class extends Base {
            constructor(...args: any[]) {
                super(args[0], options);
            }
        } as T;
    };
}
