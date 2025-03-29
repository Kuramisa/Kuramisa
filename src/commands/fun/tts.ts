import { Attachment, StringOption } from "Builders";
import { AbstractSlashCommand, SlashCommand } from "classes/SlashCommand";
import {
    ApplicationIntegrationType,
    InteractionContextType,
    type ChatInputCommandInteraction,
} from "discord.js";
import logger from "Logger";

@SlashCommand({
    name: "tts",
    description: "Text to Speech (Owner Only)",
    cooldown: 5,
    ownerOnly: true,
    integrations: [
        ApplicationIntegrationType.GuildInstall,
        ApplicationIntegrationType.UserInstall,
    ],
    contexts: [
        InteractionContextType.Guild,
        InteractionContextType.PrivateChannel,
        InteractionContextType.BotDM,
    ],
    options: [
        new StringOption()
            .setName("text")
            .setDescription("Text to convert to speech"),
    ],
})
export default class TTSCommand extends AbstractSlashCommand {
    async run(interaction: ChatInputCommandInteraction) {
        const { client, options } = interaction;

        const text = options.getString("text", true);

        if (text.length > 10000)
            return interaction.reply({
                content:
                    "The text is too long. Please limit it to 200 characters.",
                flags: "Ephemeral",
            });

        await interaction.deferReply({ flags: "Ephemeral" });

        const audio = await client.systems.elevenlabs.textToSpeech
            .convert("XQo8L2sA3feEFresvoJi", {
                text,
                model_id: "eleven_turbo_v2_5",
                output_format: "mp3_44100_128",
            })
            .catch((err) => {
                logger.error(`[TTS] Error generating audio: ${err}`);
                return null;
            });

        if (!audio) return interaction.editReply("Failed to generate audio.");

        const attachment = new Attachment(audio, {
            name: `TTS_${Date.now()}.mp3`,
        });
        await interaction.editReply({ files: [attachment] });
    }
}
