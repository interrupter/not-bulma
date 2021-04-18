import notCommon from '../common.js';
import notBase from '../base.js';

const LOG_PREFIX = 'APIQuee';

class notAPIQueue extends notBase{
  static QUEUE_CHECK_INTERVAL    = 100;

  static MAX_BUSY_TIME = 300;

  constructor(options = {}){
    super({
      working:{
        name: options.name?options.name:LOG_PREFIX
      },
      options
    });
    this.busy = false;
    this.queue = [];
    this.busySince = false;
    this.afterEmpty = null;
    this.start();
    return this;
  }

  stop(){
    if(this.interval){
      clearInterval(this.interval);
      this.interval = undefined;
      this.busy = false;
      this.busySince = false;
    }
  }

  start(){
    this.stop();
    this.interval = setInterval(this.checkQueue.bind(this), this.QUEUE_CHECK_INTERVAL);
  }

  checkQueue(){
    if(!this.isEmpty() && !this.isBusy()){
      this.setBusy()
        .runNext()
        .then(this.setFree.bind(this))
        .catch((e)=>{
          this.error(e);
          this.setFree();
        });
    }else{
      if(!this.isBusy()){
        if(this.afterEmpty){
          let t = this.afterEmpty;
          this.afterEmpty = null;
          t();
        }
      }
    }
  }

  addToQueue(task){
    this.queue.push(task);
  }

  runNext(){
    let list = this.queue.map(action=>action.title).join(', ');
    this.debug(`tasks [${list}]` );
    let task = this.queue.shift();
    if (!notCommon.isFunc(task.action)){
      this.error('В задании нет исполнимой части, action не функция', task.title);
      return Promise.resolve();
    }

    if (!notCommon.isFunc(task.resolve)){
      this.error('В задании нет возвратной части, resolve не функция', task.title);
      return task.action();
    }
    return task.action().then(task.resolve);
  }

  isBusy(){
    let busy = !!this.busy,
      now = Date.now() / 1000;
    if(busy){
      if(now - this.busySince > this.MAX_BUSY_TIME){
        this.setFree();
        return false;
      }else{
        return true;
      }
    }else{
      return false;
    }
  }

  setBusy(){
    this.busy = true;
    this.busySince = Date.now() / 1000;
    return this;
  }

  setFree(){
    this.busy = false;
    this.busySince = false;
    return this;
  }

  isEmpty(){
    return this.queue.length === 0;
  }

  /**
  * Исполнитель запросов
  * @param      {function}   action      должна возвращать Promise
  * @param      {function}   afterEmpty  будет выполнена когда очурудь опустеет и будет свободна. полезна при пачке однотипных заданий
  * @returns    {Promise}  результат функции
  **/
  run(action, afterEmpty = null, title = ''){
    if(afterEmpty && this.afterEmpty === null){
      this.afterEmpty = afterEmpty;
    }
    return new Promise((resolve, reject)=>{
      try{
        this.addToQueue({action, resolve, title});
      }catch(e){
        this.error(e);
        reject(e);
      }
    });
  }

  actionIsQueued(title){
    return this.queue.some(queued => queued.title == title);
  }

  runIfNotQueued(action, afterEmpty = null, title = ''){
    if(this.actionIsQueued(title)){
      return Promise.resolve();
    }else{
      this.run(action, afterEmpty, title);
    }
  }
}

export default notAPIQueue;
