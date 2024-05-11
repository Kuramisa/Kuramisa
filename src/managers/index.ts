import GuildManager from "./GuildManager";
import UserManager from "./UserManager";
import XPManager from "./XPManager";

export default class KManagers {
    readonly guilds: GuildManager;
    readonly users: UserManager;
    readonly xp: XPManager;

    constructor() {
        this.guilds = new GuildManager();
        this.users = new UserManager();
        this.xp = new XPManager();
    }
}
