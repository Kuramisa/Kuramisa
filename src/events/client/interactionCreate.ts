import { AbstractEvent, Event } from "classes/Event";
import type { AbstractMessageMenuCommand } from "classes/MessageMenuCommand";
import type { AbstractSlashCommand } from "classes/SlashCommand";
import { AbstractUserMenuCommand } from "classes/UserMenuCommand";
import { ChatInputCommandInteraction, type Interaction } from "discord.js";
import camelCase from "lodash/camelCase";

@Event({
    event: "interactionCreate",
    description: "Manage Slash and Menu interactions.",
})
export default class CommandInteractionManager extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const { logger, stores } = this.container;

        const { commandName } = interaction;

        const command = stores.get("commands").get(commandName) as
            | AbstractSlashCommand
            | AbstractMessageMenuCommand
            | AbstractUserMenuCommand
            | undefined;

        if (!command) {
            logger.error(
                `[Command Interaction Manager] Command ${commandName} not found.`,
            );

            return interaction.reply({
                content: "Waaa! I can't find this command!",
                flags: "Ephemeral",
            });
        }

        /*if (command.ownerOnly && !this.container.client.owners.has(user.id))
            return interaction.reply({
                content: "This command is only available to the bot owners.",
                flags: "Ephemeral",
            });*/

        /*if (command.userPermissions && interaction.inCachedGuild()) {
            const missingPerms = interaction.member.permissions.missing(
                command.userPermissions,
            );

            if (missingPerms.length) {
                logger.debug(
                    `[Command Interaction Manager] User ${user.displayName} missing permissions to run command ${command.name}.`,
                );

                return interaction.reply({
                    content: `You need the following permissions to run this command: **${missingPerms.join(", ")}**`,
                    flags: "Ephemeral",
                });
            }
        }

        if (command.botPermissions && interaction.inCachedGuild()) {
            const missingPerms =
                interaction.guild.members.me?.permissions.missing(
                    command.botPermissions,
                );

            if (missingPerms?.length) {
                logger.debug(
                    `[Command Interaction Manager] Bot missing permissions to run command ${command.name}.`,
                );

                return interaction.reply({
                    content: `I need the following permissions to run this command: **${missingPerms.join(", ")}**`,
                    flags: "Ephemeral",
                });
            }
        }*/

        // The interaction is a menu command
        if (
            command.isUserMenuCommand() &&
            interaction.isUserContextMenuCommand()
        ) {
            command.run(interaction);
            return;
        }

        if (
            interaction.isMessageContextMenuCommand() &&
            command.isMessageMenuCommand()
        ) {
            command.run(interaction);
            return;
        }

        if (!command.isSlashCommand() || !interaction.isChatInputCommand())
            return;

        const { options } = interaction;

        if (command.groups.length > 0) {
            const group = options.getSubcommandGroup();
            const subcommand = options.getSubcommand();
            const funcName = group
                ? camelCase(`slash ${group} ${subcommand}`)
                : camelCase(`slash ${subcommand}`);

            try {
                const commandFunc = command[
                    funcName as keyof typeof commandFunc
                ] as (
                    interaction: ChatInputCommandInteraction,
                ) => Promise<unknown>;

                if (typeof commandFunc === "function")
                    await commandFunc(interaction);
                else throw new Error(`Command function ${funcName} not found.`);
            } catch (error) {
                logger.error(
                    `[Command Interaction Manager] Error running command ${command.name}.\n${error}`,
                );

                if (interaction.deferred || interaction.replied)
                    await interaction.editReply({
                        content:
                            "An error occurred while executing this command.",
                        embeds: [],
                        components: [],
                    });
                else
                    await interaction.reply({
                        content:
                            "An error occurred while executing this command.",
                        flags: "Ephemeral",
                    });
            }

            return;
        }

        if (command.subcommands.length > 0) {
            const subcommand = options.getSubcommand();
            const funcName = camelCase(`slash ${subcommand}`);

            try {
                const commandFunc = command[
                    funcName as keyof typeof commandFunc
                ] as (
                    interaction: ChatInputCommandInteraction,
                ) => Promise<unknown>;

                if (typeof commandFunc === "function")
                    await commandFunc(interaction);
                else throw new Error(`Command function ${funcName} not found.`);
            } catch (error) {
                logger.error(
                    `[Command Interaction Manager] Error running command ${command.name}.\n${error}`,
                );

                if (interaction.deferred || interaction.replied)
                    await interaction.editReply({
                        content:
                            "An error occurred while executing this command.",
                        embeds: [],
                        components: [],
                    });
                else
                    await interaction.reply({
                        content:
                            "An error occurred while executing this command.",
                        flags: "Ephemeral",
                    });
            }

            return;
        }

        try {
            await command.run(interaction);
        } catch (error) {
            logger.error(
                `[Command Interaction Manager] Error running command ${command.name}.\n${error}`,
            );

            if (interaction.deferred || interaction.replied)
                await interaction.editReply({
                    content: "An error occurred while executing this command.",
                    embeds: [],
                    components: [],
                });
            else
                await interaction.reply({
                    content: "An error occurred while executing this command.",
                    flags: "Ephemeral",
                });
        }
    }
}
