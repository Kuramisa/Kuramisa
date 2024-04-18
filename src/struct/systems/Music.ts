import { Player } from "discord-player";
import { container } from "@sapphire/framework";

export default class Music extends Player {
    constructor() {
        super(container.client);

        this.extractors
            .loadDefault((ext) => ext !== "YouTubeExtractor")
            .then(() => {
                container.logger.info(
                    "[Music] Loaded all extractors except YouTubeExtractor"
                );
            })
            .catch(container.logger.error);
    }
}
