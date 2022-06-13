export default class UICommon {
  static ERROR_DEFAULT = 'Что пошло не так.';
  static DEFAULT_REDIRECT_TIMEOUT = 3000;
  static CLASS_OK = 'is-success';
  static CLASS_ERR = 'is-danger';
  static FILLER = '_';

  /**
   *  Reformats input from any string to strict phone format
   *  @param {string}    phone    free style phone number
   *  @returns {string}          phone number
   **/
  static formatPhone(val, filler = this.FILLER) {
    //starting from 11 digits in phone number
    const slots = [1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5];
    let digits = val.replace(/\D/g, '');
    //if there are more, move them to country code slot
    if (digits.length > 11) {
      let d = digits.length - 11;
      while (d > 0) {
        d--;
        slots.unshift(1);
      }
    }
    let stack = ['', '', '', '', ''];
    Array.from(digits).forEach((digit, index) => {
      let slot = slots[index];
      stack[slot - 1] = (stack[slot - 1] + digit);
    });
    //creating map of parts lengths
    const lens = slots.reduce((acc, curr) => {
      if (typeof acc[curr] === 'undefined') {
        acc[curr] = 1;
      } else {
        acc[curr] += 1;
      }
      return acc;
    }, {});
    //fill empty positions with filler (_)
    for (let t in stack) {
      let dif = lens[parseInt(t) + 1] - stack[t].length;
      while (dif > 0) {
        stack[t] = (stack[t] + filler);
        dif--;
      }
    }
    return `+${stack[0]} (${stack[1]}) ${stack[2]}-${stack[3]}-${stack[4]}`;
  }

  static MONEY_SIGN = '&#8381;';

  static setMoneySign(val) {
    this.MONEY_SIGN = val;
  }

  static formatPrice(price) {
    let major = parseInt(Math.floor(price / 100)),
      minor = parseInt(price % 100);
    major = '' + major;
    return `${this.MONEY_SIGN}${major}.${minor}`;
  }

  static formatLocaleDatetime(dt){
    const date = dt.toLocaleDateString(window.navigator.language);
    const time = dt.toLocaleTimeString(window.navigator.language);
    return `${date} ${time}`
  }

  static tryFormatLocaleDateTime(value){
    if(typeof value == 'string'){
      const dt = new Date(value);
      return UICommon.formatLocaleDatetime(dt);
    }else if(typeof value == 'object'){
      return UICommon.formatLocaleDatetime(value);
    }else{
      return '';
    }
  }

  static formatTimestamp(timestamp, offset = 0) {
    let offsetLocal = new Date().getTimezoneOffset();
    let deltaOffset = (offsetLocal - parseInt(offset)) * 60 * 1000;
    let localDateTime = new Date(parseInt(timestamp) - deltaOffset);
    return localDateTime.toLocaleString(window.navigator.language);
  }

  static TIME = {
    SECONDS: ['секунду', 'секунды', 'секунд'],
    MINUTES: ['минуту', 'минуты', 'минут'],
    HOURS: ['час', 'часа', 'часов']
  };

  static declOfNum(n, text_forms) {
    n = Math.abs(n) % 100;
    let n1 = n % 10;
    if (n > 10 && n < 20) {
      return text_forms[2];
    }
    if (n1 > 1 && n1 < 5) {
      return text_forms[1];
    }
    if (n1 == 1) {
      return text_forms[0];
    }
    return text_forms[2];
  }

  static humanizedTimeDiff(date /* unix time */) {
    let currentTime = new Date().getTime();
    let sec = Math.round((currentTime - date) / 1000);
    let unit;
    if (sec < 60) {
      unit = this.declOfNum(sec, this.TIME.SECONDS);
      return `${sec} ${unit} назад`;
    } else if (sec < 3600) {
      let min = Math.floor(sec / 60);
      unit = this.declOfNum(min, this.TIME.MINUTES);
      return `${min} ${unit} назад`;
    } else {
      let hours = Math.floor(sec / (60 * 60));
      unit = this.declOfNum(hours, this.TIME.HOURS);
      return `${hours} ${unit} назад`;
    }
  }

}
