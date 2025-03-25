import type Kuramisa from "Kuramisa";

import CommandManager from "./CommandManager";
import GuildManager from "./GuildManager";
import UserManager from "./UserManager";

export default class Managers {
    readonly commands: CommandManager;
    readonly guilds: GuildManager;
    readonly users: UserManager;

    constructor(client: Kuramisa) {
        this.commands = new CommandManager(client);
        this.guilds = new GuildManager(client);
        this.users = new UserManager(client);
    }
}
