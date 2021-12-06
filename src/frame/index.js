//import 'babel-polyfill/dist/polyfill';

/*
  Common functions
*/
import notCommon from './common.js';

/*
  framework wide parser for data access
*/
import notPath from 'not-path';

import notRouter from './router.js';

import * as notAPI from './api';
/*
  basic event handlers and core data modifiers
*/
import notBase from './base.js';

import {COMPONENTS} from './LIB.js';
/*
  application main infrastructure setter
*/
import notApp from './app.js';
/*
  user controllers
*/
import notController from './controller.js';
import notRecord from './record.js'; //  wrapper for data with server live interactions
import notInterface from './interface.js'; //  wrapper for data with server live interactions

/*
  Form validation rails
*/

import FormValidationBuilder from './validation/builder.js';
import FormValidationRunner from './validation/runner.js';
import FormValidationSession from './validation/session.js';

export {
  notCommon,
  notPath,
  notController,
  notBase,
  notRouter,
  notRecord,
  notInterface,
  notApp,
  notAPI,
  COMPONENTS,
  FormValidationBuilder,
  FormValidationRunner,
  FormValidationSession,
};
