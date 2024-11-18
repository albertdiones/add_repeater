import Repeater from "./index";


const repeater = new Repeater(
    () => {
        console.log(new Date());
        return Bun.sleep(Math.random()*500);
    },
    { logger: Repeater.voidLogger }
);
repeater.continuous(2000,null, { intervalMode: Repeater.intervalMode.afterFinish });


const checks = setInterval(
    function() {
        if (Date.now() % 20000 < 1000) {
            repeater.stop();
            clearInterval(checks);
        }
    },
    300
);