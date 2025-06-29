import { test, expect } from '@jest/globals'

import Repeater from '..';


class mockLogger {
    
    logCount: number = 0;
    error(...messages: any[]): void {
        this.logCount++;
    }

    warn = (...messages: any[]): void => {
        this.logCount++;
    }

    log = (...messages: any[]): void => {
        this.logCount++;
    }

    info = (...messages: any[]): void => {
        this.logCount++;
    }

    debug = (...messages: any[]): void => {
        this.logCount++;
    }
}


test(
    'logger ommited', 
    async () => {
        const logger = new mockLogger();
        Repeater.defaultLogger = logger;
        const timestamps: number[] = [];
        const repeater = new Repeater(
            () => {
                const now = Date.now();
                timestamps.push(now);
                return Promise.resolve();
            }
        );
        
        expect(logger.logCount).toBe(0);
        repeater.continuous(10,null);

        await Bun.sleep(45);

        
        expect(logger.logCount).toBeGreaterThanOrEqual(1);
        Repeater.defaultLogger = console;
    }
);



test(
    'null logger', // replace "void logger"
    async () => {
        const logger = new mockLogger();
        Repeater.defaultLogger = logger;
        const timestamps: number[] = [];
        const repeater = new Repeater(
            () => {
                const now = Date.now();
                timestamps.push(now);
                return Promise.resolve();
            },
            { logger: null }
        );
        
        expect(logger.logCount).toBe(0);
        repeater.continuous(10,null);

        await Bun.sleep(45);

        
        expect(logger.logCount).toBe(0);
        Repeater.defaultLogger = console;
    }
);