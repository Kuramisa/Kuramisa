import { Events } from "discord.js";
import Kuramisa from "../Kuramisa";

export interface IEvent {
    readonly client: Kuramisa;
    readonly event: Events | string;
    readonly description: string;
    readonly once?: boolean;

    run(...args: any[] | undefined[]): any;
}

export interface IEventOptions {
    client: Kuramisa;
    event: Events | string;
    description: string;
    once?: boolean;
}

// Decorator
export function Event(options: IEventOptions) {
    return function (target: typeof AbstractEvent) {
        return class extends target {
            constructor() {
                super(options);
                target.prototype.run = target.prototype.run.bind(this);
            }
            run(...args: any[] | undefined[]): any {
                return target.prototype.run(...args);
            }
        };
    };
}

export abstract class AbstractEvent implements IEvent {
    readonly client: Kuramisa;
    readonly event: Events | string;
    readonly description: string;
    readonly once?: boolean;

    constructor({ client, event, description, once }: IEventOptions) {
        if (!client) throw new Error("No client provided");
        if (!event) throw new Error("No event provided");
        if (!description) throw new Error("No description provided");
        this.client = client;
        this.event = event;
        this.description = description;
        this.once = once;

        this.init();
    }

    init() {
        if (this.once) {
            this.client.once(this.event, this.run.bind(this));

            return;
        }

        this.client.on(this.event, this.run.bind(this));
    }

    abstract run(...args: any[] | undefined[]): any;
}
