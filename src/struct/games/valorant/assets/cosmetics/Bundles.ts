import kuramisa from "@kuramisa";
import { randEl } from "@utils";
import Valorant from "../..";
import { KEmbed } from "@builders";
import { fetchStoreFeautured } from "..";

export default class ValorantBundles {
    private readonly data: IValorantBundle[];

    constructor(data: IValorantBundle[]) {
        this.data = data;
    }

    get all() {
        return this.data;
    }

    get(name: string) {
        return this.data.find((bundle) => bundle.displayName === name);
    }

    getByID(id: string) {
        return this.data.find((bundle) => bundle.uuid === id);
    }

    static embed(bundle: IValorantBundle, time?: number) {
        let description = "";

        if (time) description += `**Resets in <t:${time}:R>**`;
        if (bundle.description && bundle.description !== bundle.displayName)
            description += `\n\n${bundle.description}`;
        if (bundle.promoDescription)
            description += `\n${bundle.promoDescription}`;
        if (bundle.extraDescription)
            description += `\n${bundle.extraDescription}`;

        return new KEmbed()
            .setAuthor({
                name: bundle.displayName,
                iconURL: bundle.displayIcon
            })
            .setDescription(description)
            .setThumbnail(bundle.verticalPromoImage)
            .setImage(bundle.displayIcon);
    }

    static async itemEmbed(
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
            kEmojis,
            games: { valorant }
        } = kuramisa;

        let description: string;

        if (item.basePrice === 0) description = "For Free";
        else
            description = `**${kEmojis.get("val_points") ?? ""} ${item.basePrice} VP ${
                item.basePrice === item.discountedPrice
                    ? ""
                    : `(${
                          item.discountedPrice === 0
                              ? "*Free*"
                              : item.discountedPrice
                      }  with the bundle)`
            }**`;

        const embed = new KEmbed().setDescription(description);

        switch (item.type) {
            case "skin_level": {
                const contentTier = valorant.contentTiers.getByID(
                    item.contentTierUuid
                )!;

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: contentTier.displayIcon
                    })
                    .setThumbnail(item.levels[0].displayIcon)
                    .setColor(`#${contentTier.highlightColor.substring(0, 6)}`);

                break;
            }
            case "buddy": {
                let colors = await kanvas.popularColor(
                    item.levels[0].displayIcon
                );
                if (!colors) colors = ["#808080"];
                const color = randEl(colors);

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: item.displayIcon
                    })
                    .setTitle(item.levels[0].displayName)
                    .setThumbnail(item.displayIcon)
                    .setColor(color);

                break;
            }
            case "spray": {
                let colors = await kanvas.popularColor(item.displayIcon);
                if (!colors) colors = ["#808080"];
                const color = randEl(colors);

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: item.displayIcon
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
                let colors = await kanvas.popularColor(item.wideArt);
                if (!colors) colors = ["#808080"];
                const color = randEl(colors);

                embed
                    .setAuthor({
                        name: item.displayName,
                        iconURL: item.displayIcon
                    })
                    .setImage(item.wideArt)
                    .setThumbnail(item.largeArt)
                    .setColor(color);

                break;
            }
            case "player_title": {
                embed
                    .setAuthor({
                        name: item.displayName
                    })
                    .setTitle(item.titleText);
                break;
            }
        }

        return embed;
    }

    static async fetch() {
        const data = await fetch(`${Valorant.assetsURL}/bundles`)
            .then((res) => res.json())
            .then((res: any) => res.data);

        return new ValorantBundles(data);
    }

    async fetchFeatured() {
        const data = await fetchStoreFeautured();

        return data.map((bundle: any) => {
            const bundleData = this.getByID(bundle.bundle_uuid);
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
                            itemData = valorant.skins.getByID(item.uuid)!;
                            break;
                        case "buddy":
                            itemData = valorant.buddies.getByID(item.uuid)!;
                            break;
                        case "player_card":
                            itemData = valorant.playerCards.getByID(item.uuid)!;
                            break;
                        case "spray":
                            itemData = valorant.sprays.getByID(item.uuid)!;
                            break;
                        case "player_title":
                            itemData = valorant.playerTitles.getByID(
                                item.uuid
                            )!;
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
                        promoItem: item.promo_item
                    };
                }),
                secondsRemaining: bundle.seconds_remaining,
                expiresAt: bundle.expires_at
            } as IValorantFeaturedBundle;
        }) as IValorantFeaturedBundle[];
    }
}
