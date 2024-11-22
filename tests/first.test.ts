import { test, expect } from '@jest/globals'

import Repeater from '..';

test(
    'first test',
    async () => {


        const timestamps: number[] = [];
        const repeater = new Repeater(
            () => {
                const now = Date.now();
                console.log(now);
                timestamps.push(now);
                return Promise.resolve();
            }
        );
        repeater.continuous(100,null);

        await Bun.sleep(900);

        expect(timestamps.length).toBe(9);

        await Bun.sleep(500);
        repeater.stop();
        
        expect(timestamps.length).toBe(14);

        await Bun.sleep(500);
        
        expect(timestamps.length).toBe(14);
    }
);


test(
    'testing the limit',
    async () => {


        const timestamps: number[] = [];
        const repeater = new Repeater(
            () => {
                const now = Date.now();
                console.log(now);
                timestamps.push(now);
                return Promise.resolve();
            }
        );
        await repeater.continuous(100,10);

        expect(timestamps.length).toBe(10);
    }
);