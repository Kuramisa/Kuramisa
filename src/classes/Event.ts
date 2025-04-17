import { Listener } from "@sapphire/framework";

export abstract class AbstractEvent extends Listener {
    constructor(context: Listener.LoaderContext, options: Listener.Options) {
        super(context, options);
    }
}

export function Event(options: Listener.Options) {
    return function <T extends new (...args: any[]) => AbstractEvent>(
        Base: T,
    ): T {
        return class extends Base {
            constructor(...args: any[]) {
                super(args[0], options);
            }

            run(...args: unknown[]): unknown {
                // @ts-expect-error Ignoring the type error here
                // because we are using a decorator to add the options and run will exist at runtime
                return super.run(...args);
            }
        } as T;
    };
}
