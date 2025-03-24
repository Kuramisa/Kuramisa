import { ButtonStyle } from "discord.js";
import Valorant from "../..";
import { Button, Embed, Row } from "@builders";
import logger from "Logger";
import { fetch } from "@sapphire/fetch";

export default class ValorantWeapons {
    private readonly data: IValorantWeapon[];

    constructor(data: IValorantWeapon[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (weapon: string) =>
        this.data.find(
            (wp) => wp.displayName.toLowerCase() === weapon.toLowerCase()
        ) ?? this.data.find((wp) => wp.uuid === weapon);

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/weapons`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantWeapons(data);
    }

    generateDamagesDescription(weapon: IValorantWeapon) {
        let description = "- ***Damage Values***\n";

        for (const range of weapon.weaponStats.damageRanges) {
            description += `  - **${range.rangeStartMeters}m - ${range.rangeEndMeters}m:** ${range.headDamage} Head / ${range.bodyDamage} Body / ${range.legDamage} Legs\n`;
        }

        return description;
    }

    embed(weapon: IValorantWeapon) {
        const embed = new Embed()
            .setAuthor({
                name: `${weapon.displayName} (${
                    weapon.shopData?.category ?? "Melee"
                })`,
                iconURL: weapon.killStreamIcon,
            })
            .setImage(weapon.displayIcon);

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
        new Row().setComponents(
            new Button()
                .setCustomId(
                    `valorant_weapon_skins_${weapon.displayName.toLowerCase()}`
                )
                .setLabel("Skins")
                .setStyle(ButtonStyle.Success)
        );
}
