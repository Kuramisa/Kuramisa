import ValorantAgents from "./info/Agents";
import ValorantVersion from "./info/Version";
import ValorantWeapons from "./info/Weapons";
import ValorantCeremonies from "./info/Ceremonies";
import ValorantCompetitiveSeasons from "./info/CompetitiveSeasons";
import ValorantCompetitiveTiers from "./info/CompetitiveTiers";
import ValorantContentTiers from "./info/ContentTiers";
import ValorantContracts from "./info/Contracts";
import ValorantCurrencies from "./info/Currencies";
import ValorantEvents from "./info/Events";
import ValorantMaps from "./info/Maps";
import ValorantMissions from "./info/Missions";
import ValorantObjectives from "./info/Objectives";
import ValorantSeasons from "./info/Seasons";
import ValorantThemes from "./info/Themes";

import ValorantBuddies from "./cosmetics/Buddies";
import ValorantBundles from "./cosmetics/Bundles";
import ValorantLevelBorders from "./cosmetics/LevelBorders";
import ValorantPlayerCards from "./cosmetics/PlayerCards";
import ValorantPlayerTitles from "./cosmetics/PlayerTitles";
import ValorantSkins from "./cosmetics/Skins";
import ValorantSprays from "./cosmetics/Sprays";

export {
    ValorantAgents,
    ValorantCeremonies,
    ValorantCompetitiveSeasons,
    ValorantCompetitiveTiers,
    ValorantContentTiers,
    ValorantContracts,
    ValorantCurrencies,
    ValorantEvents,
    ValorantMaps,
    ValorantMissions,
    ValorantObjectives,
    ValorantSeasons,
    ValorantThemes,
    ValorantVersion,
    ValorantWeapons,
};

export {
    ValorantBuddies,
    ValorantBundles,
    ValorantLevelBorders,
    ValorantPlayerCards,
    ValorantPlayerTitles,
    ValorantSkins,
    ValorantSprays,
};

export const fetchStoreFeautured = async () =>
    fetch("https://api.henrikdev.xyz/valorant/v2/store-featured", {
        method: "GET",
        headers: {
            Authorization: process.env.HENRIKDEV_API_KEY ?? "",
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res: any) => res.data) as any;
