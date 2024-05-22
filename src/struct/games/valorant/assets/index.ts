import Agents from "./info/Agents";
import Buddies from "./cosmetics/Buddies";
import Bundles from "./cosmetics/Bundles";
import Ceremonies from "./info/Ceremonies";
import CompetitiveTiers from "./info/CompetitiveTiers";
import CompetitiveSeasons from "./info/CompetitiveSeasons";
import ContentTiers from "./info/ContentTiers";
import Contracts from "./info/Contracts";
import Currencies from "./info/Currencies";
import Events from "./info/Events";
import Gamemodes from "./info/Gamemodes";
import Skins from "./cosmetics/Skins";
import Gear from "./info/Gear";
import LevelBorders from "./cosmetics/LevelBorders";
import Maps from "./info/Maps";
import Missions from "./info/Missions";
import Objectives from "./info/Objectives";
import PlayerCards from "./cosmetics/PlayerCards";
import PlayerTitles from "./cosmetics/PlayerTitles";
import Seasons from "./info/Seasons";
import Sprays from "./cosmetics/Sprays";
import Themes from "./info/Themes";
import Weapons from "./info/Weapons";
import Version from "./info/Version";

export const fetchStoreOffers = async () =>
    fetch("https://api.henrikdev.xyz/valorant/v2/store-offers", {
        method: "GET",
        headers: {
            Authorization: process.env.HENRIKDEV_API_KEY ?? "",
            "Content-Type": "application/json"
        }
    }).then((res) => res.json()) as any;

export const fetchStoreFeautured = async () =>
    fetch("https://api.henrikdev.xyz/valorant/v2/store-featured", {
        method: "GET",
        headers: {
            Authorization: process.env.HENRIKDEV_API_KEY ?? "",
            "Content-Type": "application/json"
        }
    })
        .then((res) => res.json())
        .then((res: any) => res.data) as any;

export {
    Agents,
    Buddies,
    Bundles,
    Ceremonies,
    CompetitiveTiers,
    CompetitiveSeasons,
    ContentTiers,
    Contracts,
    Currencies,
    Events,
    Gamemodes,
    Skins,
    Gear,
    LevelBorders,
    Maps,
    Missions,
    Objectives,
    PlayerCards,
    PlayerTitles,
    Seasons,
    Sprays,
    Themes,
    Weapons,
    Version
};
