import Repeater from "./index";


const repeater = new Repeater(
    () => {
        console.log(new Date());
        return Bun.sleep(Math.random()*1000);
    },
    { logger: Repeater.voidLogger }
);

// somehow this test ends up having a few ms excess so it's not yet perfect, but the 2 modes are working as I intend so it's good enough
repeater.continuous(2000,null, { intervalMode: Repeater.intervalMode.fixed });