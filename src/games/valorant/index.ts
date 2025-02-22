import logger from "Logger";
import { ValorantAgents } from "./assets";
import ms from "ms";

export default class Valorant {
    initialized = false;

    agents: ValorantAgents;

    static readonly trackerURL = (username: string) =>
        `https://tracker.gg/valorant/profile/riot/${username}`;

    static readonly assetsURL = "https://valorant-api.com/v1";

    constructor() {
        this.agents = new ValorantAgents([]);
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

            logger.info("[Valorant] Initialized Assets");
        } catch (err) {
            logger.error(err);
        }

        this.initialized = true;

        logger.info(`[Valorant] Initialized in ${ms(Date.now() - startTime)}`);
    }
}
