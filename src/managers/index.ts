import type Kuramisa from "@kuramisa";
import GuildManager from "./GuildManager";
import UserManager from "./UserManager";

export default class Managers {
    readonly guilds: GuildManager;
    readonly users: UserManager;

    constructor(client: Kuramisa) {
        this.guilds = new GuildManager(client);
        this.users = new UserManager(client);
    }
}
