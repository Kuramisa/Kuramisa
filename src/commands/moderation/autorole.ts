import { KRoleOption, KStringOption } from "@builders";
import { AbstractSlashCommand, SlashCommand } from "@classes/SlashCommand";
import { ChatInputCommandInteraction } from "discord.js";

@SlashCommand({
    name: "autorole",
    description: "Set the autorole for the server",
    subcommands: [
        {
            name: "add",
            description: "Add an autorole",
            options: [
                new KRoleOption()
                    .setName("role_to_add")
                    .setDescription("The role to add as an autorole")
            ]
        },
        {
            name: "remove",
            description: "Remove an autorole",
            options: [
                new KStringOption()
                    .setName("role_to_remove")
                    .setDescription("The role to remove as an autorole")

                    .setAutocomplete(true)
            ]
        }
    ]
})
export default class AutoRoleCommand extends AbstractSlashCommand {
    async slashAdd(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const { guildId, options } = interaction;
        const { database } = this.client;

        const db = await database.guilds.fetch(guildId);

        const role = options.getRole("role_to_add", true);

        if (db.autorole.includes(role.id))
            return interaction.reply({
                content: `${role} is already an autorole`,
                ephemeral: true
            });

        db.autorole.push(role.id);
        await db.save();

        interaction.reply({
            content: `${role} has been added as an autorole`,
            ephemeral: true
        });
    }

    async slashRemove(interaction: ChatInputCommandInteraction) {
        if (!interaction.guildId) return;

        const { guildId, options } = interaction;
        const { database } = this.client;

        const db = await database.guilds.fetch(guildId);

        const role = options.getString("role_to_remove", true);

        if (role.length < 1)
            return interaction.reply({
                content: "Please provide a role to remove",
                ephemeral: true
            });

        if (!db.autorole.includes(role))
            return interaction.reply({
                content: `${role} is not an autorole`,
                ephemeral: true
            });

        db.autorole = db.autorole.filter((r) => r !== role);
        await db.save();

        interaction.reply({
            content: `${role} has been removed as an autorole`,
            ephemeral: true
        });
    }
}
