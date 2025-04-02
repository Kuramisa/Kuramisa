import { Command, type CommandOptions } from "@sapphire/framework";
import { ApplicationIntegrationType, InteractionContextType } from "discord.js";

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
}
