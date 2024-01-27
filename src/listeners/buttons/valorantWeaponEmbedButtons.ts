import { Listener } from "@sapphire/framework";
import { ButtonInteraction, ComponentType } from "discord.js";

export class ValorantWeaponEmbedButtons extends Listener {
    constructor(ctx: Listener.LoaderContext, opts: Listener.Options) {
        super(ctx, {
            ...opts,
            name: "Valorant Weapon Embed Buttons",
            event: "interactionCreate",
        });
    }

    async run(interaction: ButtonInteraction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("valorant_weapon_")) return;

        const { customId } = interaction;

        const {
            games: { valorant },
        } = this.container;
        const { weapons } = valorant;

        if (!valorant.initialized)
            return interaction.reply({
                content: "**😞 Valorant is not initialized yet!**",
                ephemeral: true,
            });

        const weaponId = customId.split("_")[3];
        const weapon = weapons.getByID(weaponId);
        if (!weapon) return;

        if (customId.includes("skins")) {
            const skins = weapon.skins
                .filter((skin) => skin.contentTierUuid)
                .sort((a, b) => a.displayName.localeCompare(b.displayName));

            await interaction.deferReply();

            const infoCollection = valorant.skins.collection(skins);

            let page = 0;
            let levelPage = 0;

            const skin = infoCollection.at(page);
            if (!skin) return;

            const message = await interaction.editReply({
                embeds: [skin.level.embeds[0]],
                components: valorant.util.determineComponents(skin, true),
            });

            const buttonNames = [
                "previous_skin",
                "next_skin",
                "add_to_wishlist",
            ];

            const buttonCollector = message.createMessageComponentCollector({
                filter: (i) =>
                    i.user.id === interaction.user.id &&
                    (buttonNames.includes(i.customId) ||
                        i.customId.includes("valorant_skin_chroma")),
                componentType: ComponentType.Button,
            });

            const menuCollector = message.createMessageComponentCollector({
                filter: (i) =>
                    i.user.id === interaction.user.id &&
                    i.customId === "valorant_weapon_skin_level_select",
                componentType: ComponentType.StringSelect,
            });

            buttonCollector.on("collect", async (i) => {
                switch (i.customId) {
                    case "previous_skin": {
                        page = page > 0 ? --page : infoCollection.size;
                        levelPage = 0;
                        break;
                    }
                    case "next_skin": {
                        page = page + 1 < infoCollection.size ? ++page : 0;
                        levelPage = 0;
                        break;
                    }
                    case "add_to_wishlist": {
                        await i.reply({
                            content: "**😁 Coming Soon™️!**",
                            ephemeral: true,
                        });
                        return;
                    }
                }

                if (i.customId.includes("valorant_skin_chroma")) {
                    const skin = infoCollection.at(page);
                    if (!skin) return;
                    const chromaPage = parseInt(i.customId.split("_")[3]);
                    if (isNaN(chromaPage)) return;

                    await valorant.util.updateInfoChroma(
                        i,
                        skin,
                        chromaPage,
                        true
                    );
                    return;
                }

                const skin = infoCollection.at(page);
                if (!skin) return;

                await valorant.util.updateInfoLevel(i, skin, levelPage, true);
            });

            menuCollector.on("collect", async (i) => {
                levelPage = parseInt(i.values[0]);
                const skin = infoCollection.at(page);
                if (!skin) return;
                await valorant.util.updateInfoLevel(i, skin, levelPage, true);
            });
        }
    }
}
