import Repeater from "./index";

const repeater = new Repeater(
    () => {
        console.log(new Date());
        return Promise.resolve();
    }
);
repeater.continuous(1000,null);