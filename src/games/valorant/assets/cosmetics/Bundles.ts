import { Embed } from "Builders";
import type {
    APIValorantBuddy,
    APIValorantBundle,
    APIValorantPlayerCard,
    APIValorantPlayerTitle,
    APIValorantSkin,
    APIValorantSpray,
} from "typings/APIValorant";

import { container } from "@sapphire/pieces";
import { fetch } from "games/valorant/API";
import type { ValorantBundleItem } from "typings/Valorant";

export default class ValorantBundles {
    private readonly data: APIValorantBundle[];

    constructor(data: APIValorantBundle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (bundle: string) =>
        this.data.find((b) => b.uuid === bundle) ??
        this.data.find((b) => b.displayName === bundle);

    embed(bundle: APIValorantBundle, time?: number) {
        let description = "";

        if (time) description += `**Resets in <t:${time}:R>**`;
        if (bundle.description && bundle.description !== bundle.displayName)
            description += `\n\n${bundle.description}`;
        if (bundle.promoDescription)
            description += `\n${bundle.promoDescription}`;
        if (bundle.extraDescription)
            description += `\n${bundle.extraDescription}`;

        return new Embed()
            .setAuthor({
                name: bundle.displayName,
                iconURL: bundle.displayIcon,
            })
            .setDescription(description)
            .setThumbnail(bundle.verticalPromoImage)
            .setImage(bundle.displayIcon);
    }

    async itemEmbed(
        item: ValorantBundleItem &
            (
                | (APIValorantSkin & { type: "skin_level" })
                | (APIValorantBuddy & { type: "buddy" })
                | (APIValorantPlayerCard & { type: "player_card" })
                | (APIValorantSpray & { type: "spray" })
                | (APIValorantPlayerTitle & { type: "player_title" })
            ),
    ) {
        const {
            kanvas,
            kEmojis: emojis,
            games: { valorant },
        } = container.client;

        let description: string;

        if (item.BasePrice === 0) description = "For Free";
        else
            description = `**${emojis.get("val_points") ?? ""} ${item.BasePrice} VP ${
                item.BasePrice === item.DiscountedPrice
                    ? ""
                    : `(${
                          item.DiscountedPrice === 0
                              ? "*Free*"
                              : item.DiscountedPrice
                      }  with the bundle)`
            }**`;

        const embed = new Embed().setDescription(description);

        switch (item.type) {
            case "skin_level": {
                const contentTier = valorant.contentTiers.get(
                    item.contentTierUuid,
                )!;

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: contentTier.displayIcon,
                    })
                    .setThumbnail(item.levels[0].displayIcon)
                    .setColor(`#${contentTier.highlightColor.substring(0, 6)}`);

                break;
            }
            case "buddy": {
                const color = await kanvas.popularColor(
                    item.levels[0].displayIcon,
                );

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: item.displayIcon,
                    })
                    .setTitle(item.levels[0].displayName)
                    .setThumbnail(item.displayIcon)
                    .setColor(color);

                break;
            }
            case "spray": {
                const color = await kanvas.popularColor(item.displayIcon);

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: item.displayIcon,
                    })
                    .setTitle(item.levels[0].displayName)
                    .setThumbnail(
                        item.animationGif
                            ? item.animationGif
                            : item.fullTransparentIcon,
                    )
                    .setColor(color);
                break;
            }
            case "player_card": {
                const color = await kanvas.popularColor(item.wideArt);

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: item.displayIcon,
                    })
                    .setImage(item.wideArt)
                    .setThumbnail(item.largeArt)
                    .setColor(color);

                break;
            }
            case "player_title": {
                embed
                    .setAuthor({
                        name: item.displayName,
                    })
                    .setTitle(item.titleText);
                break;
            }
        }

        return embed;
    }

    static readonly init = async () =>
        new ValorantBundles(await fetch("bundles"));
}
