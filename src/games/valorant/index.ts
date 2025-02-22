import logger from "Logger";
import { ValorantAgents, ValorantVersion, ValorantWeapons } from "./assets";
import ms from "ms";

export default class Valorant {
    initialized = false;

    agents: ValorantAgents;

    weapons: ValorantWeapons;
    version?: ValorantVersion;

    static readonly trackerURL = (username: string) =>
        `https://tracker.gg/valorant/profile/riot/${username}`;

    static readonly assetsURL = "https://valorant-api.com/v1";

    constructor() {
        this.agents = new ValorantAgents([]);
        this.weapons = new ValorantWeapons([]);
    }

    async init() {
        if (this.initialized) {
            logger.info("[Valorant] Already Initialized!");
            return;
        }

        const startTime = Date.now();
        logger.info("[Valorant] Initializing...");

        try {
            logger.info("[Valorant] Initializing Assets...");

            logger.debug("[Valorant] Initializing Agents...");
            this.agents = await ValorantAgents.init();
            logger.debug("[Valorant] Agents: " + this.agents.all.length);
            logger.debug(`[Valorant] Initialized Agents`);

            logger.debug("[Valorant] Initializing Weapons...");
            this.weapons = await ValorantWeapons.init();
            logger.debug("[Valorant] Weapons: " + this.weapons.all.length);
            logger.debug(`[Valorant] Initialized Weapons`);

            logger.debug("[Valorant] Initializing Version...");
            this.version = await ValorantVersion.init();
            logger.debug(`[Valorant] Initialized Version`);

            logger.info("[Valorant] Initialized Assets");
        } catch (err) {
            logger.error(err);
        }

        this.initialized = true;

        logger.info(`[Valorant] Initialized in ${ms(Date.now() - startTime)}`);
    }
}
