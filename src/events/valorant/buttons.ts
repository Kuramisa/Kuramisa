import { AbstractEvent, Event } from "classes/Event";
import { ComponentType, Interaction } from "discord.js";

@Event({
    event: "interactionCreate",
    description: "Manage Valorant Related Buttons",
})
export default class ValorantButtons extends AbstractEvent {
    async run(interaction: Interaction) {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("valorant_weapon_")) return;

        const {
            games: { valorant },
        } = this.client;

        if (!valorant.initialized)
            return interaction.reply({
                content: "**😞 Valorant is not initialized yet!**",
                flags: ["Ephemeral"],
            });

        const { customId } = interaction;

        const { weapons } = valorant;

        const weaponName = customId.split("_")[3];
        const weapon = weapons.get(weaponName);

        if (!weapon)
            return interaction.reply({
                content: "**😞 Weapon not found!**",
                flags: ["Ephemeral"],
            });

        if (customId.includes("skins")) {
            const skins = weapon.skins
                .filter((skin) => skin.contentTierUuid)
                .sort((a, b) => a.displayName.localeCompare(b.displayName));

            await interaction.deferReply();

            const infoCollection = valorant.skins.collection(skins);

            let page = 0;
            let lvlPage = 0;

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
                        lvlPage = 0;
                        break;
                    }
                    case "next_skin": {
                        page = page + 1 < infoCollection.size ? ++page : 0;
                        lvlPage = 0;
                        break;
                    }
                    case "add_to_wishlist": {
                        await i.reply({
                            content: "**😁 Coming Soon™️!**",
                            flags: ["Ephemeral"],
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

                await valorant.util.updateInfoLevel(i, skin, lvlPage, true);
            });

            menuCollector.on("collect", async (i) => {
                lvlPage = parseInt(i.values[0]);
                const skin = infoCollection.at(page);
                if (!skin) return;
                await valorant.util.updateInfoLevel(i, skin, lvlPage, true);
            });
        }
    }
}
