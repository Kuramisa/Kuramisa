import { container } from "@sapphire/pieces";

export default {
    Query: {
        weapons: () => {
            return container.games.valorant.weapons.all.map((wp) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { skins, ...weapon } = wp;
                return weapon;
            });
        },
        weapon: (
            _: any,
            {
                weaponUuid,
                withSkins,
            }: { weaponUuid: string; withSkins: boolean }
        ) => {
            const weapon = container.games.valorant.weapons.getByID(weaponUuid);
            if (!weapon) return null;
            if (withSkins) return weapon;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { skins, ...weaponWithoutSkins } = weapon;
            return weaponWithoutSkins;
        },
        skins: (_: any, { weaponUuid }: { weaponUuid: string }) => {
            const weapon = container.games.valorant.weapons.getByID(weaponUuid);
            if (!weapon) return null;
            return weapon.skins;
        },
    },
};
