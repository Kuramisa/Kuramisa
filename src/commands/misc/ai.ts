import { Subcommand } from "@sapphire/plugin-subcommands";
import { AttachmentBuilder } from "discord.js";

export class AICommand extends Subcommand {
    constructor(ctx: Subcommand.LoaderContext, opts: Subcommand.Options) {
        super(ctx, {
            ...opts,
            name: "ai",
            description: "AI Chat Bot",
            subcommands: [
                {
                    name: "chat",
                    chatInputRun: "chatInputChat",
                },
                {
                    name: "image",
                    chatInputRun: "chatInputImage",
                },
            ],
        });
    }

    override registerApplicationCommands(registry: Subcommand.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommand((command) =>
                    command
                        .setName("chat")
                        .setDescription("Chat with the AI")
                        .addStringOption((option) =>
                            option
                                .setName("message")
                                .setDescription("Message to send to the AI")
                                .setRequired(true)
                        )
                )
                .addSubcommand((command) =>
                    command
                        .setName("image")
                        .setDescription("Get an AI generated image")
                        .addStringOption((option) =>
                            option
                                .setName("prompt")
                                .setDescription("Prompt for the AI")
                                .setRequired(true)
                        )
                )
        );
    }

    async chatInputChat(interaction: Subcommand.ChatInputCommandInteraction) {
        const {
            systems: { openai },
            util,
        } = this.container;

        const { options, user } = interaction;

        const message = options.getString("message", true);

        await interaction.deferReply();

        const response = await openai.createChat(
            message,
            user.id,
            user.globalName ?? user.username
        );
        if (!response)
            return await interaction.editReply("No response from AI");
        if (response.length > 2000)
            return await util.pagination.embedContents(
                interaction,
                _.chunk(response, 4)
            );
        await interaction.editReply(response);
    }

    async chatInputImage(interaction: Subcommand.ChatInputCommandInteraction) {
        const {
            systems: { openai },
            logger,
        } = this.container;

        const prompt = interaction.options.getString("prompt", true).trim();

        await interaction.reply(
            `**Generating an image with the prompt \`${prompt}\`...**`
        );

        try {
            const response = await openai.createImage(prompt);
            if (!response)
                return await interaction.editReply("No response from AI");

            const attachment = new AttachmentBuilder(response, {
                name: `${prompt.trim()}.png`,
            });

            await interaction.editReply({
                content: `**${prompt.trim()}**`,
                files: [attachment],
            });
        } catch (error: any) {
            if (error.response) {
                logger.error(`Prompt: ${prompt}`, error.response);
                await interaction.editReply(error.response.data.error.message);
            } else {
                logger.error(`Prompt: ${prompt}`, error.message);
                await interaction.editReply(error.message);
            }
        }
    }
}
