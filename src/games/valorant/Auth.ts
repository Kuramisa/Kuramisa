import { Auth } from "@valapi/auth";
import type { ChatInputCommandInteraction } from "discord.js";
import { bold } from "discord.js";
import logger from "Logger";

import type Valorant from ".";

export default class ValorantAuth {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async login(interaction: ChatInputCommandInteraction) {
        const { client, options, user } = interaction;

        const accounts = this.valorant.accounts.get(user.id);

        if (!accounts) {
            logger.debug(
                `${user.displayName} Problem with Valorant to not being initialized`,
            );

            return interaction.reply({
                content: bold("Something went wrong"),
                flags: "Ephemeral",
            });
        }

        if (accounts.size >= 5)
            return interaction.reply({
                content: bold("You can't have more than 5 accounts"),
                flags: "Ephemeral",
            });

        const username = options.getString("valorant_username", true);

        if (accounts.has(username))
            return interaction.reply({
                content: bold("You already have this account added!"),
                flags: "Ephemeral",
            });

        const db = await client.managers.users.get(user.id);

        if (db.valorant?.accounts.find((acc) => acc.username === username))
            return interaction.reply({
                content: bold("You already have this account added!"),
                flags: "Ephemeral",
            });

        await interaction.deferReply({ flags: "Ephemeral" });

        const password = options.getString("valorant_password", true);

        const auth = new Auth();
        const hCaptcha = await auth.captcha();
        const { data: captcha } = await client.systems.captcha.hcaptcha({
            pageurl: "https://authenticate.riotgames.com/api/v1/login",
            sitekey: hCaptcha.sitekey,
            data: hCaptcha.rqdata,
            userAgent:
                "RiotClient/91.0.2.1870.3774 rso-auth (Windows;10;;Professional, x64)",
        });

        const failedLogin = await auth
            .login({
                username,
                password,
                captcha,
            })
            .then(() => true)
            .catch((err) => {
                logger.error(
                    `Failed to login to Valorant with ${username} - ${user.displayName}`,
                );
                logger.error(err);

                return false;
            });

        if (!failedLogin) return;
    }
}
