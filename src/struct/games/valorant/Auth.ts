import Valorant from "./index";
import { container } from "@sapphire/pieces";
import {
    ChatInputCommandInteraction,
    ComponentType,
    ModalSubmitInteraction,
    TextInputStyle,
} from "discord.js";
import { ValError, WebClient } from "valorant.ts";

export default class ValorantAuth {
    private readonly valorant: Valorant;

    constructor(valorant: Valorant) {
        this.valorant = valorant;
    }

    async login(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const { database, logger, util } = container;

        let currentInteraction:
            | ChatInputCommandInteraction
            | ModalSubmitInteraction = interaction;

        const accounts = this.valorant.accounts.get(user.id);

        if (!accounts) {
            logger.debug(
                user.username,
                "Problem with valorant accounts to not being initialized"
            );

            return currentInteraction.reply({
                content: "**😲 Something went wrong!**",
                ephemeral: true,
            });
        }

        if (accounts.size >= 5)
            return currentInteraction.reply({
                content: "**😲 You can only have 5 accounts added!**",
                ephemeral: true,
            });

        const username = options.getString("val_username", true);

        if (accounts.has(username))
            return currentInteraction.reply({
                content: "**😲 You already have this account added!**",
                ephemeral: true,
            });

        const db = await database.users.fetch(user.id);

        if (db.valorant.accounts.find((acc) => acc.username === username))
            return currentInteraction.reply({
                content: "**😲 You already have this account added!**",
                ephemeral: true,
            });

        const web = new WebClient({
            version: this.valorant.version?.riotClient,
        });

        const password = options.getString("val_password", true);

        try {
            await web.login(username, password);
        } catch (err) {
            if (err instanceof Error) {
                logger.error(err);
                return currentInteraction.reply({
                    content: "**😲 Your username or password is incorrect!**",
                    ephemeral: true,
                });
            }
        }

        if (web.authenticationInfo.isError) {
            logger.error(web.authenticationInfo.message);

            return currentInteraction.reply({
                content: "**😲 Something went wrong!**",
                ephemeral: true,
            });
        }

        if (web.authenticationInfo.isMultifactor) {
            return currentInteraction.reply({
                content:
                    "**😭 You have MFA enabled!** **Sadly Riot removed MFA code sending through this method, We will bring back later when we find the fix or an alternative**",
                ephemeral: true,
            });

            /*const row = util
                .modalRow()
                .addComponents(
                    util
                        .input()
                        .setCustomId("val_multifactor")
                        .setLabel("Multifactor Code")
                        .setPlaceholder("Enter the code from your email")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                );

            const modal = util
                .modal()
                .setTitle("It seems you have MFA enabled")
                .setCustomId("val_mfa")
                .addComponents(row);

            await interaction.showModal(modal);

            currentInteraction = await interaction.awaitModalSubmit({
                time: 0,
            });

            const code =
                currentInteraction.fields.getTextInputValue("val_multifactor");

            try {
                await web.verify(parseInt(code));
            } catch (err) {
                if (err instanceof ValError) {
                    logger.error(err);
                    return currentInteraction.reply({
                        content: "**😲 Incorrect MFA Code**",
                        ephemeral: true,
                    });
                }
            }*/
        }

        try {
            const playerInfo: ValorantPlayerInfo = (await web.getUserInfo())
                .data;

            accounts.set(username, {
                username,
                user,
                auth: web,
                player: playerInfo,
                trackerURL: Valorant.trackerURL.replaceAll(
                    "%username%",
                    `${playerInfo.acct.game_name}%23${playerInfo.acct.tag_line}`
                ),
            });

            db.valorant.accounts.push({ username, json: web.toJSON() });
            db.markModified("valorant");
            await db.save();

            return currentInteraction.reply({
                content: `**😊 You have successfully logged in as \`${playerInfo.acct.game_name}#${playerInfo.acct.tag_line} (${username})\`**`,
                ephemeral: true,
            });
        } catch (err) {
            if (err instanceof ValError) {
                logger.error(err);
                return currentInteraction.reply({
                    content: "**😲 Incorrect MFA Code provided**",
                    ephemeral: true,
                });
            }
        }
    }

    async logout(interaction: ChatInputCommandInteraction) {
        const { options, user } = interaction;

        const accounts = this.valorant.accounts.get(user.id);
        if (!accounts) return;

        const { database, util } = container;
        const db = await database.users.fetch(user.id);

        const chosenAcc = options.getString("your_val_account");

        if (chosenAcc) {
            if (chosenAcc === "null")
                return interaction.reply({
                    content: "**😲 You don't have any accounts added!**",
                    ephemeral: true,
                });

            const acc = accounts.get(chosenAcc);
            if (!acc)
                return interaction.reply({
                    content: "**😲 You don't have this account added!**",
                    ephemeral: true,
                });
            accounts.delete(chosenAcc);
            db.valorant.accounts = db.valorant.accounts.filter(
                (acc) => acc.username !== chosenAcc
            );

            db.markModified("valorant");
            await db.save();

            return interaction.reply({
                content: `**😊 You have successfully logged out from\`${acc.player.acct.game_name}#${acc.player.acct.tag_line} (${chosenAcc})\`**`,
                ephemeral: true,
            });
        }

        const row = util.row().setComponents(
            util
                .stringMenu()
                .setCustomId("your_val_accounts")
                .setPlaceholder("Choose an account(s)")
                .setMinValues(1)
                .setMaxValues(accounts.size)
                .setOptions(
                    accounts.map((acc) => ({
                        label: `${acc.player.acct.game_name}#${acc.player.acct.tag_line} (${acc.username})`,
                        value: acc.username,
                    }))
                )
        );

        const msg = await interaction.reply({
            content: "**😊 Choose an account(s) to logout from**",
            components: [row],
            ephemeral: true,
        });

        const sInteraction = await msg.awaitMessageComponent({
            componentType: ComponentType.StringSelect,
            filter: (i) => i.user.id === user.id,
        });

        const chosenAccounts = sInteraction.values;

        if (chosenAccounts.length === 0)
            return sInteraction.reply({
                content: "**😲 You didn't choose any accounts!**",
                ephemeral: true,
            });

        const deletedAccounts = [];

        for (const chosenAcc of chosenAccounts) {
            const accountExists = accounts.get(chosenAcc);
            if (!accountExists) continue;
            accounts.delete(chosenAcc);
            db.valorant.accounts = db.valorant.accounts.filter(
                (acc) => acc.username !== chosenAcc
            );
            deletedAccounts.push(accountExists);
        }

        db.markModified("valorant");
        await db.save();

        const deletedAccountList = deletedAccounts.map(
            (acc) =>
                `\`${acc.player.acct.game_name}#${acc.player.acct.tag_line} (${acc.username})\``
        );

        return sInteraction.update({
            content: `**😊 You have successfully logged out from\n${deletedAccountList.join(
                "\n"
            )}**`,
            components: [],
        });
    }
}
