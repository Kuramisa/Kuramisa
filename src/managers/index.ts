import CommandManager from "./CommandManager";
import GuildManager from "./GuildManager";
import UserManager from "./UserManager";

export default class Managers {
    readonly commands: CommandManager;
    readonly guilds: GuildManager;
    readonly users: UserManager;

    constructor() {
        this.commands = new CommandManager();
        this.guilds = new GuildManager();
        this.users = new UserManager();
    }
}
