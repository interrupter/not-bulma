import notBase from '../base.js';
const LOG_PREFIX = 'APIConnection';

class notAPIConnection extends notBase{
  static int;
  static online;

  constructor(options) {
    super({
      options,
      working: {
        name: options.name?options.name:LOG_PREFIX
      }
    });
    this.online = null;
    this.run();
    return this;
  }

  run() {
    this.int = window.setInterval(this.check.bind(this), 1000);
  }

  pause() {
    window.clearInterval(this.int);
  }

  resume() {
    this.run();
  }

  isOnline(){
    return window.navigator.onLine;
  }

  check() {
    let t = this.isOnline();
    if (this.online !== null) {
      if (this.online !== t) {
        this.changeState(t);
      }
    }
    this.online = t;
  }

  changeState(online = false) {
    if (online) {
      this.emit('online');
    } else {
      this.emit('offline');
    }
  }
}

export default notAPIConnection;
