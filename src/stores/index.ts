import type Kuramisa from "Kuramisa";

import CommandStore from "./CommandStore";
import EventStore from "./EventStore";

export default class Stores {
    readonly commands: CommandStore;
    readonly events: EventStore;

    constructor(client: Kuramisa) {
        this.commands = new CommandStore();
        this.events = new EventStore(client);
    }
}
