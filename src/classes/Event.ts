import { Events } from "discord.js";
import KuramisaClass from "../Kuramisa";
import EventEmitter from "events";
import kuramisa from "../index";

export interface IEvent {
    readonly event: Events | string;
    readonly description: string;
    readonly emitter?: KuramisaClass | EventEmitter;
    readonly once?: boolean;

    run(...args: any[] | undefined[]): any;
}

export interface IEventOptions {
    event: Events | string;
    description: string;
    emitter?: KuramisaClass | EventEmitter;
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
    readonly client = kuramisa;
    readonly event: Events | string;
    readonly description: string;
    readonly emitter: KuramisaClass | EventEmitter;
    readonly once?: boolean;

    /**
     * @param {IEventOptions} options
     * @param {Events | string} options.event
     * @param {string} options.description
     * @param {KuramisaClass | EventEmitter} [options.emitter]
     * @param {boolean} [options.once]
     * @constructor
     * @abstract
     * @class
     * @public
     * @this {AbstractEvent}
     * @memberof AbstractEvent
     * @returns {AbstractEvent}
     * @description The AbstractEvent class is the base class for all events.
     */

    constructor({
        event,
        description,
        emitter = kuramisa,
        once,
    }: IEventOptions) {
        if (!event) throw new Error("No event provided");
        if (!description) throw new Error("No description provided");
        this.event = event;
        this.description = description;
        this.emitter = emitter;
        this.once = once;

        this.init();
    }

    init() {
        if (this.once) {
            (this.emitter as EventEmitter).once(
                this.event,
                this.run.bind(this)
            );

            return;
        }

        (this.emitter as EventEmitter).on(this.event, this.run.bind(this));
    }

    abstract run(...args: any[] | undefined[]): any;
}
