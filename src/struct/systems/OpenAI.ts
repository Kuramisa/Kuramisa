import { container } from "@sapphire/framework";
import type { ChatInputCommandInteraction, Message } from "discord.js";
import { OpenAI as OpenAIApi } from "openai";

const { ASH, STEALTH, OPENAI_API_KEY } = process.env;

export default class OpenAI extends OpenAIApi {
    constructor() {
        super({
            apiKey: OPENAI_API_KEY,
        });
    }

    async createChat(prompt: string, userId: string, username: string) {
        let systemMessage =
            "Your name is Kuramisa. You are Stealth's and Ash's pet fox. Your owners are Stealth and Ash. No one can be your owner but Stealth and Ash.";

        if (userId === ASH)
            systemMessage +=
                " You are talking to your owner Ash. You do not have to greet him or anything. But you can decide to greet him if you want to.";
        if (userId === STEALTH)
            systemMessage +=
                " You are talking to your owner Stealth. You do not have to greet him or anything. But you can decide to greet him if you want to.";

        if (prompt.length === 0)
            systemMessage += ` Greet ${username} and ask them if they need assistance.`;

        const completion = await this.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: systemMessage,
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "gpt-3.5-turbo",
        });

        return completion.choices[0].message.content;
    }

    async createImage(prompt: string) {
        const completion = await this.images.generate({
            prompt,
            model: "dall-e-3",
        });

        return completion.data[0].url;
    }

    throwError(
        error: any,
        prompt: string,
        interaction?: ChatInputCommandInteraction | null,
        message?: Message | null
    ) {
        const { logger } = container;

        try {
            if (error.response) {
                logger.error(`Prompt: ${prompt}}`, error.response);
                if (interaction) {
                    if (interaction.guild)
                        logger.error(`in ${interaction.guild.name}`);
                    if (interaction.replied) {
                        interaction.editReply(
                            error.response.data.error.message
                        );
                    } else {
                        interaction.reply(error.response.data.error.message);
                    }
                }

                if (message) {
                    if (message.guild) logger.error(`in ${message.guild.name}`);
                    message.reply(error.response.data.error.message);
                }
            } else {
                logger.error(`Prompt: ${prompt}`, error.message);
                if (interaction) {
                    if (interaction.guild)
                        logger.error(`in ${interaction.guild.name}`);
                    if (interaction.replied) {
                        interaction.editReply(error.message);
                    } else {
                        interaction.reply(error.message);
                    }
                }

                if (message) {
                    if (message.guild) logger.error(`in ${message.guild.name}`);
                    message.reply(error.message);
                }
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
