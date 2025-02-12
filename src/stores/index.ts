import CommandStore from "./CommandStore";
import EventStore from "./EventStore";

export default class Stores {
    readonly commands: CommandStore;
    readonly events: EventStore;

    constructor() {
        this.commands = new CommandStore();
        this.events = new EventStore();
    }
}
