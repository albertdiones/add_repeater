type recursivePromise = Promise<recursivePromise | null>;

interface loggerInterface {
    error: (...messages: any) => void;
    warn: (...messages: any) => void;
    log: (...messages: any) => void;
    info: (...messages: any) => void;
    debug: (...messages: any) => void;
}
const doNothing = (...messages: any) => {};
class VoidLogger implements loggerInterface {
    error = doNothing
    warn = doNothing;
    log = doNothing;
    info = doNothing;
    debug = doNothing;
}

class Repeater {
    action: () => Promise<any>;
    logger: loggerInterface;

    static sleep:(interval: number) => Promise<any>;

    static defaultLogger: loggerInterface = console;
    static voidLogger: loggerInterface = new VoidLogger();

    constructor(action: () => Promise<any>, options: {logger?:loggerInterface}={}) {
        this.action = action;
        this.logger = options.logger ?? Repeater.defaultLogger;
    }
    async continuous(interval: number,limit: number | null, originalLimit: number | null = null): recursivePromise {
        originalLimit = originalLimit ?? limit;
        let runs = 0;
        const forever = limit===null;
        this.logger.debug(`Running for ${limit} times every ${interval/1000} seconds`);
        return this.action()
            .then(
                () => {
                    runs++;
                    this.logger.debug(`Run successful (${runs}${forever ? '' : '/'+ originalLimit})`);
                    if (!forever && runs >= limit) {
                        return false;
                    }
                    return true;
                }
            )
            .then((continueRunning) => {
                if (!continueRunning) {
                    return false;
                }
                this.logger.debug(`sleeping for ${interval} ms...`);
                return Repeater.sleep(interval);
            })
            .then(
                (continueRunning) => {
                    if (continueRunning === false) {
                        return null;
                    }
                    return this.continuous(interval,forever ? null : limit-runs, originalLimit);
                }
            );
    }
}

if (Bun) {
    Repeater.sleep = (interval: number) => Bun.sleep(interval);
}

export default Repeater;