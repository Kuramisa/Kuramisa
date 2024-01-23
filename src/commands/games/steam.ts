import { Command } from "@sapphire/framework";
import { ButtonStyle, ComponentType } from "discord.js";
import moment from "moment";
//import { GameInfo, UserBans, UserPlaytime, UserSummary } from "steamapi";

export class SteamCommand extends Command {
    constructor(ctx: Command.LoaderContext, opts: Command.Options) {
        super(ctx, {
            ...opts,
            name: "steam",
            description: "Steam Helper",
            preconditions: ["InDevelopment"],
        });
    }

    /**
     * Register Slash Command
     */
    override registerApplicationCommands(registry: Command.Registry) {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName("steam_user")
                        .setDescription("Steam User URL/ID")
                        .setRequired(true)
                )
        );
    }

    /**
     * Execute Slash Command
     */

    // TODO: Fix the Last 2 weeks played on Steam Games
    /*async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
        const {
            games: { steam },
            logger,
            util,
        } = this.container;

        const { options } = interaction;

        let urlOrId = options.getString("steam_user", true);

        if (
            !parseInt(urlOrId) &&
            !urlOrId.includes("https://steamcommunity.com")
        ) {
            urlOrId = `https://steamcommunity.com/id/${urlOrId}`;
        }

        try {
            const resolveId = await steam.resolve(urlOrId);

            let userProfile = await this.fetchUser(resolveId);

            const row = util
                .row()
                .setComponents(
                    util
                        .button()
                        .setCustomId("steam-profile")
                        .setLabel("Profile")
                        .setStyle(ButtonStyle.Success),
                    util
                        .button()
                        .setCustomId("steam-games")
                        .setLabel("Games")
                        .setStyle(ButtonStyle.Primary)
                );

            const navRow = util
                .row()
                .setComponents(
                    util
                        .button()
                        .setCustomId("prev_page")
                        .setEmoji("◀")
                        .setStyle(ButtonStyle.Secondary),
                    util
                        .button()
                        .setCustomId("next_page")
                        .setEmoji("▶")
                        .setStyle(ButtonStyle.Secondary)
                );

            let page = 0;

            let embeds = [this.profileEmbed(userProfile)];

            const message = await interaction.reply({
                embeds,
                components: userProfile.visible ? [row] : [],
                fetchReply: true,
            });

            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter: (i) =>
                    i.customId === "steam-profile" ||
                    i.customId === "steam-games" ||
                    i.customId === "prev_page" ||
                    i.customId === "next_page",
                time: 15000,
            });

            collector.on("collect", async (i) => {
                if (interaction.user.id !== i.user.id) {
                    await i.reply({
                        content: "This command was not executed by you",
                        ephemeral: true,
                    });
                    return;
                }
                try {
                    switch (i.customId) {
                        case "steam-profile": {
                            page = 0;

                            userProfile = await this.fetchUser(resolveId);

                            embeds = [this.profileEmbed(userProfile)];
                            await interaction.editReply({
                                components: [row],
                            });
                            break;
                        }
                        case "steam-games": {
                            const playTimes = (await steam.getUserOwnedGames(
                                resolveId,
                                {
                                    includeAppInfo: true,
                                }
                            )) as UserPlaytime<GameInfo>[];

                            embeds = playTimes
                                .sort((a, b) => b.minutes - a.minutes)
                                .map((playTime) =>
                                    util
                                        .embed()
                                        .setAuthor({
                                            name: `${userProfile.nickname}'s Games`,
                                            iconURL: userProfile.avatar.large,
                                        })
                                        .setTitle(playTime.game.name)
                                        .setDescription(
                                            `**Play time**\n\`Last 2 Weeks\`: ${
                                                playTime.recentMinutes > 60 &&
                                                playTime.recentMinutes !== 0
                                                    ? `${Math.round(
                                                          moment
                                                              .duration(
                                                                  playTime.recentMinutes,
                                                                  "minutes"
                                                              )
                                                              .asHours()
                                                      )} Hours`
                                                    : `${playTime.recentMinutes} Minutes`
                                            }\n\`Total\`: ${
                                                playTime.minutes > 60 &&
                                                playTime.minutes !== 0
                                                    ? `${Math.round(
                                                          moment
                                                              .duration(
                                                                  playTime.minutes,
                                                                  "minutes"
                                                              )
                                                              .asHours()
                                                      )} Hours`
                                                    : `${playTime.minutes} Minutes`
                                            }`
                                        )
                                        .setThumbnail(playTime.game.iconURL)
                                        .setImage(playTime.game.headerURL)
                                );
                            await interaction.editReply({
                                components: [row, navRow],
                            });
                            break;
                        }
                        case "prev_page":
                            page = page > 0 ? --page : embeds.length - 1;
                            break;
                        case "next_page":
                            page = page + 1 < embeds.length ? ++page : 0;
                            break;
                    }

                    await interaction.editReply({ embeds: [embeds[page]] });
                    await i.deferUpdate();
                } catch (err) {
                    logger.error(err);
                    logger.error("Error with Steam buttons");
                    await i.reply({
                        content: `\`\`\`xl\n${err}\`\`\``,
                        ephemeral: true,
                    });
                }
                collector.resetTimer();
            });
        } catch {
            await interaction.reply({
                content: "Steam user not found",
                ephemeral: true,
            });
        }
    }

    private personaState(state: number) {
        switch (state) {
            case 0:
                return "🔴 Offline";
            case 1:
                return "🟢 Online";
            case 2:
                return "🟡 Busy";
            case 3:
                return "🔵 Away";
            case 4:
                return "🟣 Snooze";
            case 5:
                return "🔃 Looking to Trade";
            case 6:
                return "🎮 Looking to Play";
        }
    }

    private async fetchUser(id: string) {
        const {
            games: { steam },
        } = this.container;

        return {
            ...((await steam.getUserSummary(id)) as UserSummary),
            ...((await steam.getUserBans(id)) as UserBans),
            ...(await steam.getUserBadges(id)),
        };
    }

    private profileEmbed(userProfile: any) {
        const { util } = this.container;

        const embed = util
            .embed()
            .setAuthor({
                name: `${userProfile.nickname}'s Steam Profile`,
                iconURL: userProfile.avatar.large,
                url: userProfile.url,
            })
            .setThumbnail(userProfile.avatar.large);

        if (userProfile.visibilityState === 1)
            embed.setDescription("Profile is private");
        else {
            embed
                .setDescription(
                    `**${this.personaState(userProfile.personaState)}**`
                )
                .addFields(
                    {
                        name: "Created",
                        value: `<t:${userProfile.created}:R>`,
                    },
                    {
                        name: "XP",
                        value: `\`Current\`: ${userProfile.playerXP}\n\`Needed\`: ${userProfile.playerNextLevelXP}`,
                        inline: true,
                    },
                    {
                        name: "Level",
                        value: `${userProfile.playerLevel}`,
                        inline: true,
                    },
                    {
                        name: "Bans",
                        value: `\`Community\`: ${this.yesNo(
                            userProfile.communityBanned
                        )}\n\`VAC\`: ${this.yesNo(userProfile.vacBanned)} ${
                            userProfile.vacBanned
                                ? `(${userProfile.daysSinceLastBan} days ago)`
                                : ""
                        }\n\`Economy\`: ${userProfile.economyBan}`,
                    }
                );
        }

        return embed;
    }

    private yesNo = (bool: boolean) => (bool ? "Yes" : "No");*/
}
