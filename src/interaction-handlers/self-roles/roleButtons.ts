import {
    InteractionHandler,
    InteractionHandlerTypes,
} from "@sapphire/framework";
import { bold, roleMention, type ButtonInteraction } from "discord.js";

export default class SelfRoleButtons extends InteractionHandler {
    constructor(context: InteractionHandler.LoaderContext) {
        super(context, {
            name: "self-role-buttons",
            interactionHandlerType: InteractionHandlerTypes.Button,
        });
    }

    async run(
        interaction: ButtonInteraction,
        { channel, member }: InteractionHandler.ParseResult<this>,
    ) {
        const { message } = interaction;

        const srMessage = channel.messages.find((msg) => msg.id === message.id);
        if (!srMessage)
            return interaction.reply({
                content: bold("This message is not in a self role message"),
                flags: "Ephemeral",
            });

        const srButton = srMessage.buttons.find(
            (btn) => btn.id === interaction.customId,
        );
        if (!srButton)
            return interaction.reply({
                content: bold("This button is not in a self role button"),
                flags: "Ephemeral",
            });

        if (member.roles.cache.has(srButton.roleId)) {
            await member.roles.remove(
                srButton.roleId,
                "Removed by self role button",
            );
            return interaction.reply({
                content: `Removed the role ${roleMention(srButton.roleId)}`,
                ephemeral: true,
            });
        }

        await member.roles.add(srButton.roleId, "Added by self role button");
        return interaction.reply({
            content: `Added the role ${roleMention(srButton.roleId)}`,
            ephemeral: true,
        });
    }

    async parse(interaction: ButtonInteraction) {
        if (
            !interaction.customId.includes("_sr") ||
            !interaction.inCachedGuild() ||
            !interaction.guild.members.me
        )
            return this.none();

        if (!interaction.guild.members.me.permissions.has("ManageRoles")) {
            await interaction.reply({
                content: bold("I don't have the permission to manage roles"),
                flags: "Ephemeral",
            });

            return this.none();
        }

        const {
            client: { managers },
            channelId,
            guildId,
            member,
        } = interaction;

        const guild = await managers.guilds.get(guildId);
        const dbChannel = guild.selfRoles.find(
            (channel) => channel.channelId === channelId,
        );
        if (!dbChannel) {
            await interaction.reply({
                content: bold("This button is not in a self role channel"),
                flags: "Ephemeral",
            });

            return this.none();
        }

        return this.some({
            channel: dbChannel,
            member,
        });
    }
}
