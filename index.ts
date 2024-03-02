type recursivePromise = Promise<recursivePromise | null>;

interface logger {
    error: (...messages) => void;
    warn: (...messages) => void;
    log: (...messages) => void;
    info: (...messages) => void;
    debug: (...messages) => void;
}

class Repeater {
    action: () => Promise<any>;
    logger: logger;

    static sleep:(interval: number) => Promise<any>;
    static defaultLogger: logger = console;
    constructor(action: () => Promise<any>) {
        this.action = action;
        this.logger = Repeater.defaultLogger;
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