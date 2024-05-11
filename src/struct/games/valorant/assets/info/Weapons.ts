import kuramisa from "@kuramisa";
import { ButtonStyle, EmbedBuilder } from "discord.js";
import Valorant from "../..";
import { KButton, KRow } from "@utils";

export default class ValorantWeapons {
    private readonly data: IValorantWeapon[];

    constructor(data: IValorantWeapon[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((weapon) => weapon.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((weapon) => weapon.uuid === id);
    }

    static async fetch() {
        const weaponData = await fetch(`${Valorant.assetsURL}/weapons`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        const skinPrices = await fetch(
            "https://api.henrikdev.xyz/valorant/v2/store-offers"
        )
            .then((res) => res.json())
            .then((res: any) => res.data?.offers)
            .then((res) =>
                res?.filter((offer: any) => offer.type === "skin_level")
            );

        const data = weaponData.map((weapon: any) => ({
            ...weapon,
            skins: weapon.skins.map((skin: any) => ({
                ...skin,
                cost:
                    skinPrices?.find(
                        (price: any) => price.skin_id === skin.uuid
                    )?.cost ?? 0
            }))
        }));

        return new ValorantWeapons(data);
    }

    generateDamagesDescription(weapon: IValorantWeapon) {
        let description = "- ***Damage Values***\n";

        for (const range of weapon.weaponStats.damageRanges) {
            description += ` - **${range.rangeStartMeters}m - ${range.rangeEndMeters}m:** ${range.headDamage} Head / ${range.bodyDamage} Body / ${range.legDamage} Legs\n`;
        }

        return description;
    }

    embed(weapon: IValorantWeapon) {
        const embed = new EmbedBuilder()
            .setTitle(
                `${weapon.displayName} (${
                    weapon.shopData?.category ?? "Melee"
                })`
            )
            .setThumbnail(weapon.displayIcon);

        if (weapon.shopData)
            embed.setDescription(
                `${kuramisa.kEmojis.get("val_credits")} **${
                    weapon.shopData.cost
                }**\n\n***Stats***\n${this.generateDamagesDescription(
                    weapon
                )}- **First Bullet Accuracy:** ${
                    weapon.weaponStats.firstBulletAccuracy
                }%\n- **Fire Rate:** ${
                    weapon.weaponStats.fireRate
                } rounds/sec\n- **Magazine Size:** ${
                    weapon.weaponStats.magazineSize
                } rounds/mag\n- **Alt Fire:** ${
                    weapon.weaponStats.altFireType
                        ? weapon.weaponStats.altFireType.split("::")[1]
                        : "None"
                }\n- **Wall Penetration:** ${
                    weapon.weaponStats.wallPenetration.split("::")[1]
                }\n- **Equip Time:** ${weapon.weaponStats.equipTimeSeconds} ${
                    weapon.weaponStats.equipTimeSeconds > 1
                        ? "seconds"
                        : "second"
                } \n- **Reload Time:** ${
                    weapon.weaponStats.reloadTimeSeconds
                } ${
                    weapon.weaponStats.reloadTimeSeconds > 1
                        ? "seconds"
                        : "second"
                }`
            );

        return embed;
    }

    row = (weapon: IValorantWeapon) =>
        new KRow().setComponents(
            new KButton()
                .setCustomId(`valorant_weapon_skins_${weapon.uuid}`)
                .setLabel("Skins")
                .setStyle(ButtonStyle.Success)
        );
}
