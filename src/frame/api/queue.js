import notCommon from "../common.js";
import notBase from "../base.js";

const LOG_PREFIX = "APIQuee";

class notAPIQueue extends notBase {
    static QUEUE_CHECK_INTERVAL = 100;

    static MAX_BUSY_TIME = 300;

    constructor(options = {}) {
        super({
            working: {
                name: options.name ? options.name : LOG_PREFIX,
            },
            options,
        });
        this.busy = false;
        this.queue = [];
        this.busySince = -1;
        this.afterEmpty = undefined;
        this.start();
        return this;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = undefined;
            this.busy = false;
            this.busySince = -1;
        }
    }

    start() {
        this.stop();
        this.interval = setInterval(
            this.checkQueue.bind(this),
            this.QUEUE_CHECK_INTERVAL
        );
    }

    checkQueue() {
        if (!this.isEmpty() && !this.isBusy()) {
            this.setBusy()
                .runNext()
                .then(this.setFree.bind(this))
                .catch((e) => {
                    this.error && this.error(e);
                    this.setFree();
                });
        } else {
            if (!this.isBusy()) {
                if (this.afterEmpty) {
                    let t = this.afterEmpty;
                    this.afterEmpty = undefined;
                    t();
                }
            }
        }
    }

    addToQueue(task) {
        this.queue.push(task);
    }

    runNext() {
        let list = this.queue.map((action) => action.title).join(", ");
        this.debug && this.debug(`tasks [${list}]`);
        let task = this.queue.shift();
        if (!notCommon.isFunc(task.action)) {
            this.error &&
                this.error(
                    "В задании нет исполнимой части, action не функция",
                    task.title
                );
            return Promise.resolve();
        }

        if (!notCommon.isFunc(task.resolve)) {
            this.error &&
                this.error(
                    "В задании нет возвратной части, resolve не функция",
                    task.title
                );
            return task.action();
        }
        return task.action().then(task.resolve);
    }

    isBusy() {
        let busy = !!this.busy,
            now = Date.now() / 1000;
        if (busy && this.busySince > -1) {
            if (now - this.busySince > notAPIQueue.MAX_BUSY_TIME) {
                this.setFree();
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    setBusy() {
        this.busy = true;
        this.busySince = Date.now() / 1000;
        return this;
    }

    setFree() {
        this.busy = false;
        this.busySince = -1;
        return this;
    }

    isEmpty() {
        return this.queue.length === 0;
    }

    /**
     * Исполнитель запросов
     * @param      {function}   action      должна возвращать Promise
     * @param      {function}   [afterEmpty = undefined]  будет выполнена когда очурудь опустеет и будет свободна. полезна при пачке однотипных заданий
     * @param       {string}    [title = '']    optional title of request
     * @returns    {Promise}    результат функции
     **/
    run(action, afterEmpty = undefined, title = "") {
        if (afterEmpty && typeof this.afterEmpty === "undefined") {
            this.afterEmpty = afterEmpty;
        }
        return new Promise((resolve, reject) => {
            try {
                this.addToQueue({ action, resolve, title });
            } catch (e) {
                this.error && this.error(e);
                reject(e);
            }
        });
    }

    actionIsQueued(title) {
        return this.queue.some((queued) => queued.title == title);
    }

    /**
     *
     *
     * @param      {function}   action      должна возвращать Promise
     * @param      {function}   [afterEmpty = undefined]  будет выполнена когда очурудь опустеет и будет свободна. полезна при пачке однотипных заданий
     * @param       {string}    [title = '']    optional title of request
     * @return    {Promise}
     * @memberof notAPIQueue
     */
    runIfNotQueued(action, afterEmpty = undefined, title = "") {
        if (this.actionIsQueued(title)) {
            return Promise.resolve();
        } else {
            return this.run(action, afterEmpty, title);
        }
    }
}

export default notAPIQueue;
