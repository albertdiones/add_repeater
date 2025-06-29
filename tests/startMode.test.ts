import { test, expect } from '@jest/globals'

import Repeater from '..';

test(
    'wait first',
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
        repeater.continuous(500,null,{startMode: Repeater.startMode.waitFirst});

        await Bun.sleep(400);

        expect(timestamps.length).toBe(0);

        await Bun.sleep(100);
        expect(timestamps.length).toBe(1);
        repeater.stop();
        
        expect(timestamps.length).toBe(1);

        await Bun.sleep(500);
        
        expect(timestamps.length).toBe(1);
    }
);



test(
    'action first',
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
        repeater.continuous(500,null,{startMode: Repeater.startMode.actionFirst});

        await Bun.sleep(400);

        expect(timestamps.length).toBe(1);

        await Bun.sleep(100);
        expect(timestamps.length).toBe(2);
        repeater.stop();
        
        expect(timestamps.length).toBe(2);

        await Bun.sleep(500);
        
        expect(timestamps.length).toBe(2);
    }
);