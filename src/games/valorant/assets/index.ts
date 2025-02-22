import ValorantAgents from "./info/Agents";
import ValorantVersion from "./info/Version";
import ValorantWeapons from "./info/Weapons";

export { ValorantAgents, ValorantWeapons, ValorantVersion };

export const fetchStoreOffers = async () =>
    fetch("https://api.henrikdev.xyz/valorant/v2/store-offers", {
        method: "GET",
        headers: {
            Authorization: process.env.HENRIKDEV_API_KEY ?? "",
            "Content-Type": "application/json",
        },
    }).then((res) => res.json()) as any;

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
