import KuramisaClass from "Kuramisa";
import kuramisa from "@kuramisa";
import { Events } from "discord.js";
import EventEmitter from "events";

export type IEvent = {
    readonly event: string;
    readonly once: boolean;
    readonly description: string;
    readonly emitter: KuramisaClass | EventEmitter;

    run(...args: any[] | undefined[]): any;
};

export type IEventOptions = {
    event: string | Events;
    once?: boolean;
    description?: string;
    emitter?: KuramisaClass | EventEmitter;
};

export function KEvent(options: IEventOptions) {
    return function (target: typeof AbstractKEvent) {
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

export abstract class AbstractKEvent implements IEvent {
    readonly client = kuramisa;
    readonly logger = kuramisa.logger;
    readonly event: string;
    readonly once: boolean;
    readonly description: string;
    readonly emitter: KuramisaClass | EventEmitter;

    /**
     *
     * @param name Event name
     * @param once Run it once
     * @param description Description for it
     */
    constructor({
        event,
        once = false,
        description = "Not set",
        emitter = kuramisa
    }: IEventOptions) {
        if (!event) throw new Error("Event name must be provided.");
        this.event = event;
        this.once = once;
        this.description = description;
        this.emitter = emitter;

        this.init();
    }

    init() {
        if (this.once) {
            if (this.emitter instanceof KuramisaClass) {
                this.emitter.once(this.event, this.run);
                return;
            }

            this.emitter.once(this.event, this.run);
            return;
        }

        if (this.emitter instanceof KuramisaClass) {
            this.emitter.on(this.event, this.run);
            return;
        }

        this.emitter.on(this.event, this.run);
    }

    abstract run(...args: any[] | undefined[]): any;
}
