import { Command, type CommandOptions } from "@sapphire/framework";
import { ApplicationIntegrationType, InteractionContextType } from "discord.js";
import type { IMessageMenuCommand } from "./MessageMenuCommand";
import { AbstractSlashCommand, type ISlashCommand } from "./SlashCommand";
import type { IUserMenuCommand } from "./UserMenuCommand";

export interface ICommandOptions extends CommandOptions {
    contexts?: InteractionContextType[];
    integrations?: ApplicationIntegrationType[];
}

export interface ICommand extends Command {
    contexts?: InteractionContextType[];
    integrations?: ApplicationIntegrationType[];
}

export abstract class AbstractCommand extends Command implements ICommand {
    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    constructor(context: Command.LoaderContext, options: ICommandOptions) {
        super(context, { ...options });

        this.contexts = options.contexts ?? [InteractionContextType.Guild];
        this.integrations = options.integrations ?? [
            ApplicationIntegrationType.GuildInstall,
        ];
    }

    isSlashCommand(): this is ISlashCommand {
        return this instanceof AbstractSlashCommand;
    }
    isMessageMenuCommand(): this is IMessageMenuCommand {
        return this instanceof AbstractSlashCommand;
    }
    isUserMenuCommand(): this is IUserMenuCommand {
        return this instanceof AbstractSlashCommand;
    }
}
