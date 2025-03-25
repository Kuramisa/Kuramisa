import type {
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
    options?: SlashCommandOption[];
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
    options?: SlashCommandOption[];
    subcommands?: ISlashCommandWithOptions[];
    groups?: ISlashCommandSubcommandOptions[];
}

export interface ISlashCommand extends ICommand {
    readonly data: SlashCommandBuilder;
    run(interaction: ChatInputCommandInteraction): any;
    [key: `slash${string}`]: (interaction: ChatInputCommandInteraction) => any;
}

export abstract class AbstractSlashCommand
    extends AbstractCommand
    implements ISlashCommand
{
    readonly options: SlashCommandOption[] = [];
    readonly subcommands: ISlashCommandWithOptions[] = [];
    readonly groups: ISlashCommandSubcommandOptions[] = [];

    readonly data: SlashCommandBuilder;

    constructor({
        name,
        description,
        detailedDescription,
        cooldown,
        botPermissions,
        userPermissions,
        contexts,
        integrations,
        options,
        subcommands,
        groups,
    }: ISlashCommandOptionsAll) {
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

        this.data = new SlashCommandBuilder()
            .setName(name)
            .setDescription(description);

        if (integrations) this.data.setIntegrationTypes(integrations);
        else
            this.data.setIntegrationTypes(
                ApplicationIntegrationType.GuildInstall,
            );

        if (contexts) this.data.setContexts(contexts);
        else this.data.setContexts(InteractionContextType.Guild);

        if (options && subcommands)
            throw new Error("Cannot have both options and subcommands");
        if (options && groups)
            throw new Error("Cannot have both options and groups");

        if (userPermissions)
            this.data.setDefaultMemberPermissions(
                new PermissionsBitField(userPermissions).bitfield,
            );

        if (options) {
            this.options = options;
            for (const option of options) {
                this.addOption(this.data, option);
            }
        }

        if (subcommands) {
            this.subcommands = subcommands;
            this.initSubcommands();
        }

        if (groups) {
            this.groups = groups;
            this.initGroups();
        }
    }

    initSubcommands() {
        for (const subcommand of this.subcommands) {
            const command = new SlashCommandSubcommandBuilder()
                .setName(subcommand.name)
                .setDescription(subcommand.description);

            if (subcommand.options) {
                for (const option of subcommand.options) {
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

                if (subcommand.options) {
                    for (const option of subcommand.options) {
                        this.addOption(sub, option);
                    }
                }

                command.addSubcommand(sub);
            }

            this.data.addSubcommandGroup(command);
        }
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
            default:
                throw new Error("Invalid option type.");
        }
    }
}

export function SlashCommand(options: ISlashCommandOptionsAll) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractSlashCommand) {
        return class extends target {
            constructor() {
                super(options);
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
