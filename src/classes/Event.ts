import { Listener, type ListenerOptions } from "@sapphire/framework";

export interface IEvent extends Listener {
    description: string;
}

export interface IEventOptions extends ListenerOptions {
    description?: string;
}

export abstract class AbstractEvent extends Listener implements IEvent {
    readonly description: string;
    constructor(context: Listener.LoaderContext, options: IEventOptions) {
        super(context, { ...options });

        this.description = options.description ?? "No description provided";
    }

    abstract run(...args: any[] | undefined[]): unknown;
}

// Decorator
export function Event(options: IEventOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return function (target: typeof AbstractEvent) {
        return class extends target {
            constructor(context: Listener.LoaderContext) {
                super(context, {
                    ...options,
                });
                target.prototype.run = target.prototype.run.bind(this);
            }
            run(...args: any[] | undefined[]): any {
                return target.prototype.run(...args);
            }
        };
    } as any;
}
