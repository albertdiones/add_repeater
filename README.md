RepeaterJs

Todos:
 * Ability to stop repeating or stop the loop (like "break" on loop constructs)

Repeat an action continuously for specified amount of times (or forever)

```
import Repeater from "./index";

const repeater = new Repeater(
    () => {
        console.log(new Date());
        return Promise.resolve();
    }
);
repeater.continuous(1000,null);
```


```
import Repeater from "./index";


const repeater = new Repeater(
    () => {
        console.log(new Date());
        return Promise.resolve();
    },
    { logger: Repeater.voidLogger } // no logs
);
repeater.continuous(1000,null);
```
