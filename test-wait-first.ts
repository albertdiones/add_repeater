import Repeater from "./index";


const repeater = new Repeater(
    () => {
        console.log(new Date());
        return Promise.resolve();
    }
);
repeater.continuous(3000,null,{startMode: Repeater.startMode.waitFirst});