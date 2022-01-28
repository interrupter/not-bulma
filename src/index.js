import './scss/style.scss';

import * as Elements from './elements';

import * as Frame from './frame';

import {LOCALE, say, notLocale} from './locale';

const Locale = {LOCALE, say, notLocale};

Object.keys(Elements.Forms).forEach((fieldtype) => {
  Frame.notFormUtils.addComponent(fieldtype, Elements.Forms[fieldtype]);
});

export {
  Elements,
  Frame,
  Locale,
  LOCALE, say, notLocale
};
