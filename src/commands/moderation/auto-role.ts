import type { Args } from "@sapphire/framework";
import { RoleOption, StringOption } from "Builders";
import {
    AbstractSlashSubcommand,
    SlashSubcommand,
} from "classes/SlashSubcommand";
import type { ChatInputCommandInteraction, Message } from "discord.js";

@SlashSubcommand({
    name: "auto-role",
    description: "Set the Auto role for the server",
    requiredClientPermissions: ["ManageRoles"],
    requiredUserPermissions: ["ManageRoles"],
    subcommands: [
        {
            name: "add",
            description: "Add an autorole",
            chatInputRun: "slashAdd",
            messageRun: "messageAdd",
            opts: [
                new RoleOption()
                    .setName("role_to_add")
                    .setDescription("The role to add as an autorole"),
            ],
        },
        {
            name: "remove",
            description: "Remove an autorole",
            chatInputRun: "slashRemove",
            messageRun: "messageRemove",
            opts: [
                new StringOption()
                    .setName("role_to_remove")
                    .setDescription("The role to remove as an autorole")
                    .setAutocomplete(true),
            ],
        },
    ],
})
export default class AutoRoleCommand extends AbstractSlashSubcommand {
    async messageAdd(message: Message, args: Args) {
        if (!message.inGuild()) return;

        const {
            client: { managers },
            guild,
        } = message;

        const db = await managers.guilds.get(guild.id);

        const role = await args.pick("role").catch(() => null);

        if (!role)
            return message.reply({
                content: "Please provide a role to add as an autorole",
            });

        if (role.id === guild.roles.everyone.id)
            return message.reply({
                content: "You cannot add the everyone role as an autorole",
            });

        if (db.autorole.includes(role.id))
            return message.reply({
                content: `${role} is already an autorole`,
            });

        db.autorole.push(role.id);
        await db.save();

        await message.reply({
            content: `${role} has been added as an autorole`,
        });
    }

    async messageRemove(message: Message, args: Args) {
        if (!message.inGuild()) return;

        const {
            client: { managers },
            guild,
        } = message;

        const role = await args.pick("role").catch(() => null);
        if (!role)
            return message.reply({
                content: "Please provide a role to remove as an autorole",
            });

        if (role.id === guild.roles.everyone.id)
            return message.reply({
                content: "You cannot remove the everyone role as an autorole",
            });

        const db = await managers.guilds.get(guild.id);
        if (!db.autorole.includes(role.id))
            return message.reply({
                content: `${role} is not an autorole`,
            });

        db.autorole = db.autorole.filter((r) => r !== role.id);
        await db.save();
        await message.reply({
            content: `${role} has been removed as an autorole`,
        });
    }

    async slashAdd(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const {
            client: { managers },
            guild,
            options,
        } = interaction;

        const db = await managers.guilds.get(guild.id);

        const role = options.getRole("role_to_add", true);

        if (role.id === guild.roles.everyone.id)
            return interaction.reply({
                content: "You cannot add the everyone role as an autorole",
                flags: "Ephemeral",
            });

        if (db.autorole.includes(role.id))
            return interaction.reply({
                content: `${role} is already an autorole`,
                flags: "Ephemeral",
            });

        db.autorole.push(role.id);
        await db.save();

        await interaction.reply({
            content: `${role} has been added as an autorole`,
            flags: "Ephemeral",
        });
    }

    async slashRemove(interaction: ChatInputCommandInteraction) {
        if (!interaction.inCachedGuild()) return;

        const {
            client: { managers },
            guild,
            options,
        } = interaction;

        const db = await managers.guilds.get(guild.id);

        const roleStr = options.getString("role_to_remove", true);

        const role =
            guild.roles.cache.get(roleStr) ??
            guild.roles.cache.find((r) => r.name === roleStr) ??
            (await guild.roles.fetch(roleStr).catch(() => null));

        if (!role)
            return interaction.reply({
                content: `${role} is not a valid role`,
                flags: "Ephemeral",
            });

        if (!db.autorole.includes(role.id))
            return interaction.reply({
                content: `${role} is not an autorole`,
                flags: "Ephemeral",
            });

        db.autorole = db.autorole.filter((r) => r !== role.id);
        await db.save();

        await interaction.reply({
            content: `${role} has been removed as an autorole`,
            flags: "Ephemeral",
        });
    }
}
