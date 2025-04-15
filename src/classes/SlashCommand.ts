import { Command } from "@sapphire/framework";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    SlashCommandBuilder,
} from "discord.js";
import type { SlashCommandOption } from "typings";

export class AbstractSlashCommand extends Command {
    readonly data: SlashCommandBuilder;

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    readonly opts: SlashCommandOption[] = [];

    constructor(content: Command.LoaderContext, options: Command.Options) {
        super(content, options);

        this.contexts = options.contexts ?? [InteractionContextType.Guild];
        this.integrations = options.integrations ?? [
            ApplicationIntegrationType.GuildInstall,
        ];

        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
            .setContexts(this.contexts)
            .setIntegrationTypes(this.integrations);

        if (options.opts) {
            this.opts = options.opts;
            for (const opt of this.opts) {
                this.addOption(this.data, opt);
            }
        }
    }

    private addOption(
        builder: SlashCommandBuilder,
        option: SlashCommandOption,
    ) {
        switch (option.type) {
            case ApplicationCommandOptionType.Boolean:
                builder.addBooleanOption(option);
                break;
            case ApplicationCommandOptionType.Attachment:
                builder.addAttachmentOption(option);
                break;
            case ApplicationCommandOptionType.String:
                builder.addStringOption(option);
                break;
            case ApplicationCommandOptionType.Integer:
                builder.addIntegerOption(option);
                break;
            case ApplicationCommandOptionType.User:
                builder.addUserOption(option);
                break;
            case ApplicationCommandOptionType.Channel:
                builder.addChannelOption(option);
                break;
            case ApplicationCommandOptionType.Role:
                builder.addRoleOption(option);
                break;
            case ApplicationCommandOptionType.Mentionable:
                builder.addMentionableOption(option);
                break;
            case ApplicationCommandOptionType.Number:
                builder.addNumberOption(option);
                break;
        }
    }
}
export function SlashCommand(options: Command.Options) {
    return function <T extends new (...args: any[]) => AbstractSlashCommand>(
        Base: T,
    ): T {
        return class extends Base {
            constructor(...args: any[]) {
                super(args[0], options);
            }
        } as T;
    };
}
