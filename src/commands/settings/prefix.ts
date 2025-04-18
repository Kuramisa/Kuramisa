import type { Args } from "@sapphire/framework";
import { StringOption } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import type { ChatInputCommandInteraction, Message } from "discord.js";

@SlashCommand({
    name: "prefix",
    description: "Set the prefix for the server",
    opts: [
        new StringOption()
            .setName("prefix_to_set")
            .setDescription("The prefix to set")
            .setRequired(false),
    ],
})
export default class PrefixCommand extends AbstractSlashCommand {
    async messageRun(message: Message, args: Args) {
        if (!message.inGuild()) return;
        if (!message.member) return;

        const {
            client: { managers },
            member,
        } = message;

        const guild = await managers.guilds.get(message.guildId);

        const prefix = await args.pick("string").catch(() => null);
        if (!prefix)
            return message.reply({
                content: `The current prefix is \`${guild.prefix}\``,
            });

        if (!member.permissions.has("ManageGuild"))
            return message.reply({
                content:
                    "You don't have the permission to set prefix for this server",
            });

        if (prefix.length > 2)
            return message.reply({
                content: "The prefix must be 2 characters or less",
            });

        if (prefix === guild.prefix)
            return message.reply({
                content: `The prefix is already set to \`${prefix}\``,
            });

        guild.prefix = prefix;
        await guild.save();
        return message.reply({
            content: `The prefix has been set to \`${prefix}\`\n\n**Note: We recommend using Slash commands instead of prefixes, as they are more user-friendly and easier to use, but if you prefer using commands this way, feel free.**`,
        });
    }

    async chatInputRun(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const {
            client: { managers },
            options,
            member,
        } = interaction;

        const guild = await managers.guilds.get(interaction.guildId);

        const prefix = options.getString("prefix_to_set");
        if (!prefix)
            return interaction.reply({
                content: `The current prefix is \`${guild.prefix}\``,
                flags: "Ephemeral",
            });

        if (!member.permissions.has("ManageGuild"))
            return interaction.reply({
                content:
                    "You don't have the permission to set prefix for this server",
                flags: "Ephemeral",
            });

        if (prefix.length > 2)
            return interaction.reply({
                content: "The prefix must be 2 characters or less",
                flags: "Ephemeral",
            });

        if (prefix === guild.prefix)
            return interaction.reply({
                content: `The prefix is already set to \`${prefix}\``,
                flags: "Ephemeral",
            });

        guild.prefix = prefix;
        await guild.save();

        return interaction.reply({
            content: `The prefix has been set to \`${prefix}\`\n\n**Note: We recommend using Slash commands instead of prefixes, as they are more user-friendly and easier to use, but if you prefer using commands this way, feel free.**`,
            flags: "Ephemeral",
        });
    }
}
