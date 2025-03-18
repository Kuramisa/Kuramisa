import { AbstractEvent, Event } from "classes/Event";
import type { AbstractMenuCommand } from "classes/MenuCommand";
import type { AbstractSlashCommand } from "classes/SlashCommand";
import {
    ApplicationCommandType,
    Collection,
    type Interaction,
} from "discord.js";
import camelCase from "lodash/camelCase";
import logger from "Logger";

@Event({
    event: "interactionCreate",
    description: "Manage Slash and Menu interactions.",
})
export default class CommandInteractionManager extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const { commandName, commandType, user } = interaction;

        let command = this.client.stores.commands.get(commandName);
        if (!command) {
            logger.debug(
                `[Command Interaction Manager] Command ${commandName} not found.`
            );

            return interaction.reply({
                content: "Waaa! I can't find this command!",
                flags: "Ephemeral",
            });
        }

        if (command.userPermissions && interaction.inCachedGuild()) {
            const missingPerms = interaction.member.permissions.missing(
                command.userPermissions
            );

            if (missingPerms.length) {
                logger.debug(
                    `[Command Interaction Manager] User ${user.displayAvatarURL} missing permissions to run command ${command.name}.`
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
                    command.botPermissions
                );

            if (missingPerms?.length) {
                logger.debug(
                    `[Command Interaction Manager] Bot missing permissions to run command ${command.name}.`
                );

                return interaction.reply({
                    content: `I need the following permissions to run this command: **${missingPerms.join(", ")}**`,
                    flags: "Ephemeral",
                });
            }
        }

        const { cooldowns } = this.client;

        if (!cooldowns.has(command.name))
            cooldowns.set(command.name, new Collection());

        const now = Date.now();
        const timestamps = cooldowns.get(command.name)!;
        const cooldownAmount = command.cooldown * 1000;

        if (timestamps.has(user.id)) {
            const expirationTime = timestamps.get(user.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return interaction.reply({
                    content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`,
                    flags: "Ephemeral",
                });
            }
        }

        timestamps.set(user.id, now);
        setTimeout(() => timestamps.delete(user.id), cooldownAmount);

        // The interaction is a menu command
        if (commandType !== ApplicationCommandType.ChatInput) {
            command = command as AbstractMenuCommand;
            command.run(interaction);
            return;
        }

        command = command as AbstractSlashCommand;

        const { options } = interaction;

        if (command.groups.length > 0) {
            const group = options.getSubcommandGroup();
            const subcommand = options.getSubcommand();
            const funcName = group
                ? camelCase(`slash ${group} ${subcommand}`)
                : camelCase(`slash ${subcommand}`);

            try {
                await command[funcName as any](interaction);
            } catch (error) {
                logger.error(
                    `[Command Interaction Manager] Error running command ${command.name}.\n${error}`
                );

                if (interaction.deferred || interaction.replied)
                    interaction.editReply({
                        content:
                            "An error occurred while executing this command.",
                        embeds: [],
                        components: [],
                    });
                else
                    interaction.reply({
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
                await command[funcName as any](interaction);
            } catch (error) {
                logger.error(
                    `[Command Interaction Manager] Error running command ${command.name}.\n${error}`
                );

                if (interaction.deferred || interaction.replied)
                    interaction.editReply({
                        content:
                            "An error occurred while executing this command.",
                        embeds: [],
                        components: [],
                    });
                else
                    interaction.reply({
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
                `[Command Interaction Manager] Error running command ${command.name}.\n${error}`
            );

            if (interaction.deferred || interaction.replied)
                interaction.editReply({
                    content: "An error occurred while executing this command.",
                    embeds: [],
                    components: [],
                });
            else
                interaction.reply({
                    content: "An error occurred while executing this command.",
                    flags: "Ephemeral",
                });
        }
    }
}
