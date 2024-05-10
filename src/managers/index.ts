import GuildManager from "./GuildManager";
import UserManager from "./UserManager";

export default class KManagers {
    readonly guilds: GuildManager;
    readonly users: UserManager;

    constructor() {
        this.guilds = new GuildManager();
        this.users = new UserManager();
    }
}
