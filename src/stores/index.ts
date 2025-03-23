import CommandStore from "./CommandStore";
import EventStore from "./EventStore";
import LocaleStore from "./LocaleStore";

export default class Stores {
    readonly commands: CommandStore;
    readonly events: EventStore;
    readonly locales: LocaleStore;

    constructor() {
        this.commands = new CommandStore();
        this.events = new EventStore();
        this.locales = new LocaleStore();
    }
}
