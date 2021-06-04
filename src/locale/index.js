import LOCALE from './store.js';
import notLocale from './notLocale.js';
const say = notLocale.say.bind(notLocale);

export {LOCALE, say, notLocale};
