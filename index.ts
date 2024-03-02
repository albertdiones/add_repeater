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
    logger: loggerInterface;
    limit: number;
    runs: number;
    intervalId: number;

    static sleep:(interval: number) => Promise<any>;

    static defaultLogger: loggerInterface = console;
    static voidLogger: loggerInterface = new VoidLogger();
    static startMode = StartMode;
    static intervalMode = IntervalMode;

    constructor(action: () => Promise<any>, options: {logger?:loggerInterface}={}) {
        this.action = action;
        this.logger = options.logger ?? Repeater.defaultLogger;
        this.runs = 0;
    }
    _formatRepeatLimit(limit: number | null): string {
        return limit === null ? 'forever' : `${limit} times`;
    }

    _executeSleep(interval) {
        this.logger.debug(`sleeping for ${interval} ms...`);
        return Repeater.sleep(interval);
    }

    async continuous(interval: number,limit: number | null, options: {startMode: StartMode, intervalMode: IntervalMode} = {
        startMode: StartMode.actionFirst,
        intervalMode: IntervalMode.afterFinish
    }): recursivePromise | Promise<void | null> {
        this.limit = this.limit ?? limit;
        const forever = limit===null;
        if (this.runs === 0) {
            this.logger.debug(`Running for ${this._formatRepeatLimit(limit)} every ${interval/1000} seconds`);
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
                    this.logger.debug(`Run successful (${this.runs}${forever ? '' : '/'+ this.limit})`);
                    if (!forever && this.runs >= limit) {
                        return false;
                    }
                    return true;
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
                    (continueRunning: Boolean): recursivePromise | null => {
                        if (continueRunning === false) {
                            return null;
                        }
                        return this.continuous(interval,forever ? null : limit-this.runs);
                    }
                );
        }
    }
}

if (Bun) {
    Repeater.sleep = (interval: number) => Bun.sleep(interval);
}

export default Repeater;