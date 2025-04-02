import type {
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandUserOption,
} from "discord.js";
import {
    ApplicationCommandOptionType,
    ApplicationIntegrationType,
    InteractionContextType,
    PermissionsBitField,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from "discord.js";

import type { Command } from "@sapphire/framework";
import {
    AbstractCommand,
    type ICommand,
    type ICommandOptions,
} from "./Command";

type SlashCommandOption =
    | SlashCommandAttachmentOption
    | SlashCommandChannelOption
    | SlashCommandBooleanOption
    | SlashCommandIntegerOption
    | SlashCommandMentionableOption
    | SlashCommandNumberOption
    | SlashCommandRoleOption
    | SlashCommandStringOption
    | SlashCommandUserOption;

export interface ISlashCommandWithOptions {
    name: string;
    description: string;
    opts?: SlashCommandOption[];
}

export interface ISlashCommandSubcommandOptions {
    name: string;
    description: string;
    subcommands: ISlashCommandWithOptions[];
}

export interface ISlashCommandSubcommandGroupOptions {
    groups: ISlashCommandSubcommandOptions[];
}

export interface ISlashCommandOptionsAll extends ICommandOptions {
    opts?: SlashCommandOption[];
    subcommands?: ISlashCommandWithOptions[];
    groups?: ISlashCommandSubcommandOptions[];
}

export interface ISlashCommand extends ICommand {
    readonly data: SlashCommandBuilder;
    run(interaction: ChatInputCommandInteraction): unknown;
    [key: `slash${string}`]: (
        interaction: ChatInputCommandInteraction,
    ) => unknown;
}

export abstract class AbstractSlashCommand
    extends AbstractCommand
    implements ISlashCommand
{
    readonly opts: SlashCommandOption[] = [];
    readonly subcommands: ISlashCommandWithOptions[] = [];
    readonly groups: ISlashCommandSubcommandOptions[] = [];

    readonly data: SlashCommandBuilder;

    constructor(
        context: Command.LoaderContext,
        options: ISlashCommandOptionsAll,
    ) {
        super(context, { ...options });

        this.data = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description);

        if (options.integrations)
            this.data.setIntegrationTypes(options.integrations);
        else
            this.data.setIntegrationTypes(
                ApplicationIntegrationType.GuildInstall,
            );

        if (options.contexts) this.data.setContexts(options.contexts);
        else this.data.setContexts(InteractionContextType.Guild);

        if (options.opts && options.subcommands)
            throw new Error("Cannot have both options and subcommands");
        if (options.opts && options.groups)
            throw new Error("Cannot have both options and groups");

        if (options.requiredUserPermissions)
            this.data.setDefaultMemberPermissions(
                new PermissionsBitField(options.requiredUserPermissions)
                    .bitfield,
            );

        if (options.opts) {
            this.opts = options.opts;
            for (const option of options.opts) {
                this.addOption(this.data, option);
            }
        }

        if (options.subcommands) {
            this.subcommands = options.subcommands;
            this.initSubcommands();
        }

        if (options.groups) {
            this.groups = options.groups;
            this.initGroups();
        }
    }

    initSubcommands() {
        for (const subcommand of this.subcommands) {
            const command = new SlashCommandSubcommandBuilder()
                .setName(subcommand.name)
                .setDescription(subcommand.description);

            if (subcommand.opts) {
                for (const option of subcommand.opts) {
                    this.addOption(command, option);
                }
            }

            this.data.addSubcommand(command);
        }
    }

    initGroups() {
        for (const group of this.groups) {
            const command = new SlashCommandSubcommandGroupBuilder()
                .setName(group.name)
                .setDescription(group.description);

            for (const subcommand of group.subcommands) {
                const sub = new SlashCommandSubcommandBuilder()
                    .setName(subcommand.name)
                    .setDescription(subcommand.description);

                if (subcommand.opts) {
                    for (const option of subcommand.opts) {
                        this.addOption(sub, option);
                    }
                }

                command.addSubcommand(sub);
            }

            this.data.addSubcommandGroup(command);
        }
    }

    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand(
            this.data.toJSON() as ChatInputApplicationCommandData,
        );
    }

    run(_interaction: ChatInputCommandInteraction): unknown {
        throw new Error("Method not implemented.");
    }

    [key: `slash${string}`]: (
        interaction: ChatInputCommandInteraction,
    ) => unknown;

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

export function SlashCommand(options: ISlashCommandOptionsAll) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractSlashCommand) {
        return class extends target {
            constructor(context: Command.LoaderContext) {
                super(context, { ...options });
                target.prototype.run = target.prototype.run.bind(this);

                if (options.subcommands) {
                    for (const subcommand of options.subcommands) {
                        this[`slash${subcommand.name}`] = this.run.bind(this);
                    }
                }

                if (options.groups) {
                    for (const group of options.groups) {
                        for (const subcommand of group.subcommands) {
                            this[`slash${group.name}${subcommand.name}`] =
                                this.run.bind(this);
                        }
                    }
                }

                this[`slash${this.name}`] = this.run.bind(this);
            }

            run(interaction: ChatInputCommandInteraction) {
                if (options.subcommands) {
                    const subcommand = interaction.options.getSubcommand();
                    try {
                        return target.prototype[`slash${subcommand}`](
                            interaction,
                        );
                    } catch {
                        return target.prototype.run(interaction);
                    }
                }

                if (options.groups) {
                    const group = interaction.options.getSubcommandGroup();
                    const subcommand = interaction.options.getSubcommand();
                    try {
                        return target.prototype[`slash${group}${subcommand}`](
                            interaction,
                        );
                    } catch {
                        return target.prototype.run(interaction);
                    }
                }

                return target.prototype.run(interaction);
            }

            [key: `slash${string}`]: (
                interaction: ChatInputCommandInteraction,
            ) => unknown;
        };
    } as any;
}
