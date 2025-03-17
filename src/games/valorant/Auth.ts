import { bold, ChatInputCommandInteraction } from "discord.js";
import Valorant from ".";
import kuramisa from "@kuramisa";
import logger from "Logger";

export default class ValorantAuth {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async login(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;
        const { database } = kuramisa;

        const accounts = this.valorant.accounts.get(user.id);

        if (!accounts) {
            logger.debug(
                `${user.username} Problem with valorant to not being initialized`
            );

            return interaction.reply({
                content: bold("Something went wrong"),
                flags: ["Ephemeral"],
            });
        }
    }
}
