import type { GuildQueueEvent, PlayerEvent } from "discord-player";
import type { GatewayDispatchEvents } from "discord.js";
import type { Emitters, Events } from "typings/Event";

import type Kuramisa from "../Kuramisa";

export interface IEvent {
    readonly client: Kuramisa;
    readonly event: Events;
    readonly description: string;
    readonly emitter: Emitters;
    readonly once?: boolean;

    run(...args: any[] | undefined[]): any;
}

export interface IEventOptions {
    client: Kuramisa;
    event: Events;
    description: string;
    emitter?: Emitters;
    once?: boolean;
}

export interface EventInstance {
    client: Kuramisa;
    event: string;
    description: string;
    emitter: Emitters;
    once?: boolean;
}

export abstract class AbstractEvent implements IEvent {
    readonly client: Kuramisa;
    readonly event: Events;
    readonly description: string;
    readonly once?: boolean;

    readonly emitter: Emitters = "client";

    constructor({ client, event, description, emitter, once }: IEventOptions) {
        if (!description) throw new Error("No description provided");
        this.client = client;
        this.event = event;
        this.description = description;
        this.emitter = emitter ?? this.emitter;
        this.once = once;

        this.init();
    }

    init() {
        switch (this.emitter) {
            case "client":
                if (this.once)
                    this.client.once(this.event as string, this.run.bind(this));
                else this.client.on(this.event as string, this.run.bind(this));
                break;
            case "rest":
                if (this.once)
                    this.client.rest.once(this.event, this.run.bind(this));
                else this.client.rest.on(this.event, this.run.bind(this));
                break;
            case "gateway":
                if (this.once)
                    this.client.ws.once(
                        this.event as GatewayDispatchEvents,
                        this.run.bind(this),
                    );
                else
                    this.client.ws.on(
                        this.event as GatewayDispatchEvents,
                        this.run.bind(this),
                    );
                break;
            case "process":
                if (this.once) process.once(this.event, this.run.bind(this));
                else process.on(this.event, this.run.bind(this));
                break;
            case "music-player":
                if (this.once)
                    this.client.systems.music.once(
                        this.event as PlayerEvent,
                        this.run.bind(this),
                    );
                else
                    this.client.systems.music.on(
                        this.event as PlayerEvent,
                        this.run.bind(this),
                    );
                break;
            case "music-queue":
                if (this.once)
                    this.client.systems.music.events.once(
                        this.event as GuildQueueEvent,
                        this.run.bind(this),
                    );
                else
                    this.client.systems.music.events.on(
                        this.event as GuildQueueEvent,
                        this.run.bind(this),
                    );
                break;
            default:
                throw new Error("Invalid emitter provided");
        }
    }

    abstract run(...args: any[] | undefined[]): unknown;
}

// Decorator
export function Event(options: Omit<IEventOptions, "client">) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractEvent) {
        return class extends target {
            constructor(client: Kuramisa) {
                super({
                    ...options,
                    client,
                });
                target.prototype.run = target.prototype.run.bind(this);
            }
            run(...args: any[] | undefined[]): any {
                return target.prototype.run(...args);
            }
        };
    } as any;
}
