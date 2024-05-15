import { AbstractKEvent, KEvent } from "@classes/KEvent";
import { AbstractMenuCommand } from "@classes/MenuCommand";
import { AbstractSlashCommand } from "@classes/SlashCommand";
import { ApplicationCommandType, Collection, Interaction } from "discord.js";
import { camelCase } from "lodash";

@KEvent({
    event: "interactionCreate",
    description: "Manage Slash and Context Menu interactions."
})
export default class SlashContextEvent extends AbstractKEvent {
    async run(interaction: Interaction) {
        if (!interaction.isCommand()) return;

        const { commandName, commandType, user } = interaction;

        let command = this.client.stores.commands.commands.get(commandName);
        if (!command) {
            this.logger.debug(`Command ${commandName} not found!`);
            return interaction.reply({
                content: "Waaaaa! Command not found?!",
                ephemeral: true
            });
        }

        if (
            command.userPermissions &&
            command.guildOnly &&
            interaction.inCachedGuild()
        ) {
            const missingPermissions = interaction.member.permissions.missing(
                command.userPermissions
            );
            if (missingPermissions && missingPermissions.length > 0)
                return interaction.reply({
                    content: `You need the following permissions to run this command: **${missingPermissions.join(", ")}**`,
                    ephemeral: true
                });
        }

        if (
            command.botPermissions &&
            command.guildOnly &&
            interaction.inCachedGuild()
        ) {
            const missingPermissions =
                interaction.guild.members.me?.permissions.missing(
                    command.botPermissions
                );
            if (missingPermissions && missingPermissions.length > 0)
                return interaction.reply({
                    content: `I need the following permissions to run this command: **${missingPermissions.join(", ")}**`,
                    ephemeral: true
                });
        }

        if (
            command.ownerOnly &&
            !this.client.owners.find((owner) => owner.id === user.id)
        )
            return interaction.reply({
                content: "**This command is bot owner only!**",
                ephemeral: true
            });

        if (
            command.staffOnly &&
            (!this.client.staff.find((staff) => staff.id === user.id) ||
                !this.client.owners.find((owner) => owner.id === user.id))
        )
            return interaction.reply({
                content: "**This command is bot staff only!**",
                ephemeral: true
            });

        if (
            command.inDevelopment &&
            (!this.client.staff.find((staff) => staff.id === user.id) ||
                !this.client.owners.find((owner) => owner.id === user.id))
        )
            return interaction.reply({
                content: "**This command is in development!**",
                ephemeral: true
            });

        if (
            command.betaTesterOnly &&
            (!this.client.staff.find((staff) => staff.id === user.id) ||
                !this.client.owners.find((owner) => owner.id === user.id))
        ) {
            const { managers } = this.client;
            const u = await managers.users.get(user.id);
            if (!u.betaTester)
                return interaction.reply({
                    content: "**This command is for beta testers only!**",
                    ephemeral: true
                });
        }

        if (
            commandName === "valorant" &&
            !this.client.games.valorant.initialized
        )
            return interaction.reply({
                content: "**😲 Valorant is not initialized!**",
                ephemeral: true
            });

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
                    ephemeral: true
                });
            }
        }

        timestamps.set(user.id, now);
        setTimeout(() => timestamps.delete(user.id), cooldownAmount);

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
            const funcName = group
                ? camelCase(`slash ${group} ${subcommand}`)
                : camelCase(`slash ${subcommand}`);

            try {
                await command[funcName as any](interaction);
            } catch (e) {
                this.logger.error(e);
                command.run(interaction);
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
                command.run(interaction);
            }
            return;
        }

        command.run(interaction);
    }
}
