// type RecursivePromise = Promise<RecursivePromise | null>;

interface LoggerInterface {
    error: (...messages: any[]) => void;
    warn: (...messages: any[]) => void;
    log: (...messages: any[]) => void;
    info: (...messages: any[]) => void;
    debug: (...messages: any[]) => void;
}

const doNothing = (..._messages: any) => {};

class VoidLogger implements LoggerInterface {
    error = doNothing
    warn = doNothing;
    log = doNothing;
    info = doNothing;
    debug = doNothing;
}

enum StartMode {
    actionFirst = 'actionFirst',
    waitFirst = 'waitFirst'
}

class Repeater {
    action: () => Promise<any>;
    logger: LoggerInterface;
    limit!: number;
    runs: number;

    static sleep: (interval: number) => Promise<any>;

    static defaultLogger: LoggerInterface = console;
    static voidLogger: LoggerInterface = new VoidLogger();
    static startMode = StartMode;

    constructor(action: () => Promise<any>, options: { logger?: LoggerInterface } = {}) {
        this.action = action;
        this.logger = options.logger ?? Repeater.defaultLogger;
        this.runs = 0;
    }

    _formatRepeatLimit(limit: number | null): string {
        return limit === null ? 'forever' : `${limit} times`;
    }
    
    async continuous(
        interval: number, 
        limit: number | null, 
        options: { startMode?: StartMode } = {}
    ): Promise<any | null> {
        this.limit = this.limit ?? limit;
        const forever = limit === null;
        if (this.runs === 0) {
            this.logger.debug(`Running for ${this._formatRepeatLimit(limit)} every ${interval/1000} seconds`);
        }

        let initiator = () => Promise.resolve();

        if (options?.startMode === StartMode.waitFirst) {
            initiator = () => {
                this.logger.debug(`sleeping for ${interval} ms...`);
                return Repeater.sleep(interval)
            }
        }

        return initiator().then(
                () => this.action()
            )
            .then(
                () => {
                    this.runs++;
                    this.logger.debug(`Run successful (${this.runs}${forever ? '' : '/'+ this.limit})`);
                    if (!forever && this.runs >= limit) {
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
            .then((continueRunning) => {
                if (continueRunning === false) {
                    return null;
                }
                return this.continuous(interval, forever ? null : limit);
            });
    }
}

const sleepFunc = (interval: number) => new Promise<void>(resolve => {
    setTimeout(resolve, interval)
})

if (global.Bun) {
    /* Use normal sleep func if bun version not more than or equal 1 */
    if (Bun.semver.satisfies(Bun.version, "(x.y.z | x >= 1)")) {
        Repeater.sleep = (interval: number) => Bun.sleep(interval);
    } else {
        Repeater.sleep = sleepFunc
    }
} else {
    /* Node */
    Repeater.sleep = sleepFunc
}

export default Repeater;
