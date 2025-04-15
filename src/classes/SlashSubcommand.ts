import {
    Subcommand,
    type SubcommandMappingMethod,
} from "@sapphire/plugin-subcommands";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import type { SlashCommandOption } from "typings";

export class AbstractSlashSubcommand extends Subcommand {
    readonly data: SlashCommandBuilder;

    readonly contexts: InteractionContextType[];
    readonly integrations: ApplicationIntegrationType[];

    readonly opts: SlashCommandOption[] = [];

    public constructor(
        content: Subcommand.LoaderContext,
        options: Subcommand.Options,
    ) {
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

        if (options.subcommands && options.opts)
            throw new Error(
                "You cannot use subcommands and options at the same time.",
            );

        if (options.opts) {
            this.opts = options.opts;
            for (const opt of this.opts) {
                this.addOption(this.data, opt);
            }
        }

        if (options.subcommands) {
            const subcommands = options.subcommands.filter(
                (cmd) => cmd.type === "method",
            ) as SubcommandMappingMethod[];
            const groups = options.subcommands.filter(
                (cmd) => cmd.type === "group",
            );

            for (const subcommand of subcommands) {
                const subcommandBuilder = new SlashCommandSubcommandBuilder()
                    .setName(subcommand.name)
                    .setDescription(subcommand.description);

                if (subcommand.opts) {
                    for (const opt of subcommand.opts) {
                        this.addOption(subcommandBuilder, opt);
                    }
                }

                this.data.addSubcommand(subcommandBuilder);
            }

            for (const group of groups) {
                const groupBuilder = new SlashCommandSubcommandGroupBuilder()
                    .setName(group.name)
                    .setDescription(group.description);

                for (const subcommand of group.entries) {
                    const subcommandBuilder =
                        new SlashCommandSubcommandBuilder()
                            .setName(subcommand.name)
                            .setDescription(subcommand.description);

                    if (subcommand.opts) {
                        for (const opt of subcommand.opts) {
                            this.addOption(subcommandBuilder, opt);
                        }
                    }

                    groupBuilder.addSubcommand(subcommandBuilder);
                }

                this.data.addSubcommandGroup(groupBuilder);
            }
        }
    }

    private addOption(
        builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
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
export function SlashSubcommand(options: Subcommand.Options) {
    return function <T extends new (...args: any[]) => AbstractSlashSubcommand>(
        Base: T,
    ): T {
        return class extends Base {
            constructor(...args: any[]) {
                super(args[0], options);
            }
        } as T;
    };
}
