import './scss/style.scss';

import * as Elements from './elements';

import * as Frame from './frame';

import {LOCALE, say, notLocale} from './locale';

const Locale = {LOCALE, say, notLocale};

const { notCommon, COMPONENTS, FIELDS, VARIANTS, notFormUtils } = Frame;

Object.keys(Elements.Forms).forEach((fieldtype) => {
  Frame.notFormUtils.addComponent(fieldtype, Elements.Forms[fieldtype]);
});

export {
  //UI
  Elements,
  //application framework
  Frame,
  //shorts for common elements
  notCommon, notFormUtils, COMPONENTS, FIELDS, VARIANTS,
  //localization
  Locale,
  LOCALE, say, notLocale
};
