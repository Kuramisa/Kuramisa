import { Command } from "@sapphire/framework";
import { convert } from "owospeak";

const converOpts = {
    tilde: Math.random() < 0.5,
    stutter: Math.random() < 0.5,
};

export class OwOCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "owo",
            description: "OwOify some text",
        });
    }

    /**
     * Register Slash Command and Context Menu
     */
    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName("text")
                        .setDescription("Text to OwOify")
                        .setRequired(true)
                )
        );

        registry.registerContextMenuCommand((builder) =>
            builder.setName("OwOify").setDMPermission(false).setType(3)
        );
    }

    /**
     * Execute Slash Command
     */
    async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const text = interaction.options.getString("text", true);
        const owo = convert(text, converOpts);

        return interaction.reply({ content: owo });
    }

    /**
     * Execute Context Menu
     */
    async contextMenuRun(interaction: Command.ContextMenuCommandInteraction) {
        const { channel, targetId } = interaction;

        if (!channel) return;
        const message = await channel.messages.fetch(targetId);

        if (message.content.length < 1)
            return interaction.reply({
                content: "Could not find text in the message",
                ephemeral: true,
            });

        const owo = convert(message.content, converOpts);

        return interaction.reply({ content: owo });
    }
}
