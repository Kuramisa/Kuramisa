import kuramisa from "@kuramisa";
import Valorant from "../..";
import { Embed } from "@builders";
import { fetchStoreFeautured } from "..";
import logger from "Logger";
import { fetch } from "@sapphire/fetch";

export default class ValorantBundles {
    private readonly data: IValorantBundle[];

    constructor(data: IValorantBundle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get = (bundle: string) =>
        this.data.find((b) => b.uuid === bundle) ??
        this.data.find((b) => b.displayName === bundle);

    embed(bundle: IValorantBundle, time?: number) {
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
        item: IValorantBundleItem &
            (
                | (IValorantWeaponSkin & { type: "skin_level" })
                | (IValorantBuddy & { type: "buddy" })
                | (IValorantPlayerCard & { type: "player_card" })
                | (IValorantSpray & { type: "spray" })
                | (IValorantPlayerTitle & { type: "player_title" })
            )
    ) {
        const {
            kanvas,
            kEmojis: emojis,
            games: { valorant },
        } = kuramisa;

        let description: string;

        if (item.basePrice === 0) description = "For Free";
        else
            description = `**${emojis.get("val_points") ?? ""} ${item.basePrice} VP ${
                item.basePrice === item.discountedPrice
                    ? ""
                    : `(${
                          item.discountedPrice === 0
                              ? "*Free*"
                              : item.discountedPrice
                      }  with the bundle)`
            }**`;

        const embed = new Embed().setDescription(description);

        switch (item.type) {
            case "skin_level": {
                const contentTier = valorant.contentTiers.get(
                    item.contentTierUuid
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
                    item.levels[0].displayIcon
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
                            : item.fullTransparentIcon
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

    static async init() {
        const data = await fetch<any>(`${Valorant.assetsURL}/bundles`)
            .then((res) => res.data)
            .catch((err) => {
                logger.error(err);
                return [];
            });

        return new ValorantBundles(data);
    }

    async fetchFeatured() {
        const data = await fetchStoreFeautured();

        return data.map((bundle: any) => {
            const bundleData = this.get(bundle.bundle_uuid);
            if (!bundleData)
                throw new Error(`Bundle ${bundle.bundle_uuid} not found`);

            return {
                ...bundleData,
                price: bundle.bundle_price,
                wholeSaleOnly: bundle.whole_sale_only,
                items: bundle.items.map((item: any) => {
                    const { valorant } = kuramisa.games;
                    let itemData:
                        | IValorantWeaponSkin
                        | IValorantBuddy
                        | IValorantPlayerCard
                        | IValorantSpray
                        | IValorantPlayerTitle;
                    switch (item.type) {
                        case "skin_level":
                            itemData = valorant.skins.get(item.uuid)!;
                            break;
                        case "buddy":
                            itemData = valorant.buddies.get(item.uuid)!;
                            break;
                        case "player_card":
                            itemData = valorant.playerCards.get(item.uuid)!;
                            break;
                        case "spray":
                            itemData = valorant.sprays.get(item.uuid)!;
                            break;
                        case "player_title":
                            itemData = valorant.playerTitles.get(item.uuid)!;
                            break;
                        default:
                            throw new Error(`Unknown item type ${item.type}`);
                    }

                    return {
                        ...itemData,
                        uuid: item.uuid,
                        displayName: item.name,
                        displayIcon: item.image,
                        type: item.type,
                        amount: item.amount,
                        discountPercent: item.discount_percent,
                        basePrice: item.base_price,
                        discountedPrice: item.discounted_price,
                        promoItem: item.promo_item,
                    };
                }),
                secondsRemaining: bundle.seconds_remaining,
                expiresAt: bundle.expires_at,
            } as IValorantFeaturedBundle;
        }) as IValorantFeaturedBundle[];
    }
}
