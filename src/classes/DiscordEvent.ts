import { kuramisa } from "@kuramisa";
import Kuramisa from "Kuramisa";
import { Events } from "discord.js";
import { EventEmitter } from "node:events";

export type IEvent = {
    readonly name: string;
    readonly once: boolean;
    readonly description: string;
    readonly emitter: Kuramisa | EventEmitter;

    run(...args: any[] | undefined[]): any;
};

export type IEventOptions = {
    name: string | Events;
    once?: boolean;
    description?: string;
    emitter?: Kuramisa | EventEmitter;
};

export function DiscordEvent(options: IEventOptions) {
    return function (target: typeof AbstractDiscordEvent) {
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

export abstract class AbstractDiscordEvent implements IEvent {
    readonly client = kuramisa;
    readonly logger = kuramisa.logger;
    readonly managers = kuramisa.managers;
    readonly name: string | Events;
    readonly once: boolean;
    readonly description: string;
    readonly emitter: Kuramisa | EventEmitter;

    /**
     *
     * @param name Event name
     * @param once Run it once
     * @param description Description for it
     */
    constructor({
        name,
        once = false,
        description = "Not set",
        emitter = kuramisa
    }: IEventOptions) {
        if (!name) throw new Error("Event name must be provided.");
        this.name = name;
        this.once = once;
        this.description = description;
        this.emitter = emitter;

        this.init();
    }

    init() {
        if (this.once) {
            if (this.emitter instanceof Kuramisa) {
                this.emitter.once(this.name, this.run);
                return;
            }

            this.emitter.once(this.name as string, this.run);
            return;
        }

        if (this.emitter instanceof Kuramisa) {
            this.emitter.on(this.name, this.run);
            return;
        }

        this.emitter.on(this.name, this.run);
    }

    abstract run(...args: any[] | undefined[]): any;
}
