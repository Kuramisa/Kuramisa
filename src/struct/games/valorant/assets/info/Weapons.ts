import { Weapons } from "@valapi/valorant-api.com";
import { ButtonStyle, EmbedBuilder } from "discord.js";
import { container } from "@sapphire/pieces";

export default class ValorantWeapons {
    private readonly data: Weapons.Weapons<"en-US">[];

    constructor(data: Weapons.Weapons<"en-US">[]) {
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

    generateDamagesDescription(weapon: Weapons.Weapons<"en-US">) {
        let description = "- ***Damage Values***\n";

        for (const range of weapon.weaponStats.damageRanges) {
            description += ` - **${range.rangeStartMeters}m - ${range.rangeEndMeters}m:** ${range.headDamage} Head / ${range.bodyDamage} Body / ${range.legDamage} Legs\n`;
        }

        return description;
    }

    // TODO: Add Embed method
    embed = (weapon: Weapons.Weapons<"en-US">) =>
        new EmbedBuilder()
            .setTitle(`${weapon.displayName} (${weapon.shopData.category})`)
            .setThumbnail(weapon.displayIcon)
            .setDescription(
                `${container.emojis.get("val_credits")} **${
                    weapon.shopData.cost
                }**\n\n***Stats***\n${this.generateDamagesDescription(
                    weapon,
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
                }`,
            );

    row = (weapon: Weapons.Weapons<"en-US">) =>
        container.util
            .row()
            .setComponents(
                container.util
                    .button()
                    .setCustomId(`valorant_weapon_skins_${weapon.uuid}`)
                    .setLabel("Skins")
                    .setStyle(ButtonStyle.Success),
            );
}
