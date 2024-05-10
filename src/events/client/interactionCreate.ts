import { AbstractDiscordEvent, DiscordEvent } from "@classes/DiscordEvent";
import { AbstractMenuCommand } from "@classes/MenuCommand";
import { AbstractSlashCommand } from "@classes/SlashCommand";
import { ApplicationCommandType, Interaction } from "discord.js";
import { camelCase } from "lodash";

@DiscordEvent({
    name: "interactionCreate",
    description: "Manage Slash and Context Menu interactions."
})
export default class SlashContextEvent extends AbstractDiscordEvent {
    async run(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const { commandName, commandType } = interaction;

        let command = this.client.stores.commands.commands.get(commandName);
        if (!command) {
            this.logger.debug(`Command ${commandName} not found!`);
            return interaction.reply({
                content: "Waaaaa! Command not found?!",
                ephemeral: true
            });
        }

        if (commandType !== ApplicationCommandType.ChatInput) {
            // Context Menu
            command = command as AbstractMenuCommand;
            await command.run(interaction);
            return;
        }

        command = command as AbstractSlashCommand;
        if (command.groups.length > 0) {
            const group = interaction.options.getSubcommandGroup();
            const subcommand = interaction.options.getSubcommand();
            const funcName = camelCase(`slash ${group} ${subcommand}`);
            try {
                await command[funcName as any](interaction);
            } catch (e) {
                this.logger.error(e);
                await command.run(interaction);
            }
            return;
        }

        if (command.subcommands.length > 0) {
            const subcommand = interaction.options.getSubcommand();
            const funcName = camelCase(`slash ${subcommand}`);
            try {
                await command[funcName as any](interaction);
            } catch (e) {
                this.logger.error(e);
                await command.run(interaction);
            }
            return;
        }

        await command.run(interaction);
    }
}
