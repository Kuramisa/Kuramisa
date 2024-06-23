import {
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
    PermissionsBitField,
    SlashCommandAttachmentOption,
    SlashCommandBooleanOption,
    SlashCommandBuilder,
    SlashCommandChannelOption,
    SlashCommandIntegerOption,
    SlashCommandMentionableOption,
    SlashCommandNumberOption,
    SlashCommandRoleOption,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
    SlashCommandUserOption
} from "discord.js";
import { AbstractCommand, ICommand, ICommandOptions } from "./Command";

export interface ISlashCommand extends ICommand {
    readonly description: string;
    readonly data: SlashCommandBuilder;

    run(interaction: ChatInputCommandInteraction): any;
    [key: `slash${string}`]: (interaction: ChatInputCommandInteraction) => any;
}

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

export interface ISlashCommandWithOptions extends ICommandOptions {
    options?: SlashCommandOption[];
}

export interface ISlashCommandSubcommandOptions extends ICommandOptions {
    subcommands: (ICommandOptions & ISlashCommandWithOptions)[];
}

export interface ISlashCommandSubcommandGroupOptions extends ICommandOptions {
    groups: ISlashCommandSubcommandOptions[];
}

export interface ISlashCommandOptionsAll extends ICommandOptions {
    options?: SlashCommandOption[];
    subcommands?: (ICommandOptions & ISlashCommandWithOptions)[];
    groups?: ISlashCommandSubcommandOptions[];
}

export function SlashCommand(options: ISlashCommandOptionsAll) {
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
                            interaction
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
                            interaction
                        );
                    } catch {
                        return target.prototype.run(interaction);
                    }
                }

                return target.prototype.run(interaction);
            }

            [key: `slash${string}`]: (
                interaction: ChatInputCommandInteraction
            ) => any;
        };
    } as any;
}

export abstract class AbstractSlashCommand
    extends AbstractCommand
    implements ISlashCommand
{
    readonly options: SlashCommandOption[] = [];
    readonly subcommands: (ICommandOptions & ISlashCommandWithOptions)[] = [];
    readonly groups: ISlashCommandSubcommandOptions[] = [];

    readonly data: SlashCommandBuilder = new SlashCommandBuilder();

    constructor({
        name,
        description,
        cooldown,
        ownerOnly,
        staffOnly,
        inDevelopment,
        betaTesterOnly,
        guildOnly,
        botPermissions,
        userPermissions,
        options,
        subcommands,
        groups
    }: ISlashCommandOptionsAll) {
        super({
            name,
            description,
            cooldown,
            ownerOnly,
            staffOnly,
            inDevelopment,
            betaTesterOnly,
            guildOnly,
            botPermissions,
            userPermissions
        });
        this.data
            .setName(this.name)
            .setDescription(this.description)
            .setDMPermission(!this.guildOnly);

        if (options && subcommands)
            throw new Error("Cannot have both options and subcommands.");
        if (options && groups)
            throw new Error("Cannot have both options and groups.");

        if (options) {
            this.options = options;
            for (const option of options) {
                this.addOption(this.data, option);
            }
        }

        if (subcommands) {
            this.subcommands = subcommands;
            for (const subcommand of subcommands) {
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

        if (groups) {
            this.groups = groups;
            for (const group of groups) {
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

        if (userPermissions)
            this.data.setDefaultMemberPermissions(
                new PermissionsBitField(userPermissions).bitfield
            );
    }

    run(_: ChatInputCommandInteraction) {
        throw new Error("Method not implemented.");
    }
    [key: `slash${string}`]: (interaction: ChatInputCommandInteraction) => any;

    private addOption(
        builder: SlashCommandBuilder | SlashCommandSubcommandBuilder,
        option: SlashCommandOption
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
