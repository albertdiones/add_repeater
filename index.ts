type recursivePromise = Promise<any>;

interface LoggerInterface {
    error: (...messages: any[]) => void;
    warn: (...messages: any[]) => void;
    log: (...messages: any[]) => void;
    info: (...messages: any[]) => void;
    debug: (...messages: any[]) => void;
}


enum StartMode {
    actionFirst = 'actionFirst',
    waitFirst = 'waitFirst'
}

enum IntervalMode {
    fixed = 'fixed',
    afterFinish = 'afterFinish'
}

class Repeater {
    action: () => Promise<any>;
    logger: LoggerInterface | null;
    limit: number;
    runs: number;
    intervalId: Timer;

    continue: boolean = true;

    static sleep:(interval: number) => Promise<any>;

    static defaultLogger: LoggerInterface = console;
    static voidLogger: null = null;
    static startMode = StartMode;
    static intervalMode = IntervalMode;

    constructor(action: () => Promise<any>, options?: {logger?:LoggerInterface | null}) {
        this.action = action;
        this.logger = options?.logger === undefined ? Repeater.defaultLogger : options?.logger;
        this.runs = 0;
    }
    _formatRepeatLimit(limit: number | null): string {
        return limit === null ? 'forever' : `${limit} times`;
    }

    _executeSleep(interval) {
        this.logger?.debug(`sleeping for ${interval} ms...`);
        return Repeater.sleep(interval);
    }

    stop() {
        this.continue = false;
    }

    continuous(interval: number,limit: number | null, 
        options: {startMode?: StartMode, intervalMode?: IntervalMode} = {
            startMode: StartMode.actionFirst,
            intervalMode: IntervalMode.afterFinish
        }
    ): recursivePromise {
        this.continue = true;
        this.limit = this.limit ?? limit;
        const forever = limit===null;
        if (this.runs === 0) {
            this.logger?.debug(`Running for ${this._formatRepeatLimit(limit)} every ${interval/1000} seconds`);
        }

        // redundancy, shouldn't even happen
        if (limit !== null && limit <= 0) {
            return Promise.resolve();
        }

        let initiator = () => Promise.resolve();

        if (options?.startMode === StartMode.waitFirst) {
            initiator = () => this._executeSleep(interval);
        }
        
        const chain = () => initiator().then(
                () => this.action()
            )
            .then(
                () => {
                    this.runs++;
                    this.logger?.debug(`Run successful (${this.runs}${forever ? '' : '/'+ this.limit})`);
                    if (!forever && limit <= 1) {
                        return false; // do not continue repeating
                    }
                    return true; // continue repeating
                }
            );
        if (options.intervalMode === IntervalMode.fixed) {
            return new Promise<void>((resolve, reject) => {
                this.intervalId = setInterval(() => {
                    chain().then((continueRunning) => {
                        if (!continueRunning) {
                            clearInterval(this.intervalId);
                            resolve();
                        }
                    }).catch(error => {
                        clearInterval(this.intervalId);
                        reject(error);
                    });
                }, interval);
            });
        }
        else {
            return chain()           
                .then((continueRunning) => {
                    if (!continueRunning) {
                        clearInterval(this.intervalId);
                        return false;
                    }                    
                    return this._executeSleep(interval);
                })
                .then(
                    (continueRunning: Boolean) => {
                        if (continueRunning === false) {
                            return null;
                        }
                        if (this.continue === false) {
                            return null;
                        }
                        const newLimit = forever ? null : limit-1;

                        // redundancy, avoid unnecessary call
                        if (newLimit !== null && newLimit <=0) {
                            return null;
                        }


                        return this.continuous(
                            interval,
                            newLimit
                        );
                    }
                );
        }
    }
}

Repeater.sleep = (interval: number) => new Promise<void>(resolve => {
    setTimeout(resolve, interval)
})

if (Bun) {
    /* Use normal sleep func if bun version not more than or equal 1 */
    if (Bun.semver.satisfies(Bun.version, "(x.y.z | x >= 1)")) {
        Repeater.sleep = (interval: number) => Bun.sleep(interval);
    }
}

export default Repeater;