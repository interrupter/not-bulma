//import 'babel-polyfill/dist/polyfill';

/*
  Common functions
*/
import notCommon from "./common.js";

/*
  framework wide parser for data access
*/
import notPath from "not-path";

import notRouter from "./router.js";

import * as notAPI from "./api";
import * as notStores from "./stores";
/*
  basic event handlers and core data modifiers
*/
import notBase from "./base.js";

import { COMPONENTS, FIELDS, VARIANTS } from "./LIB.js";
/*
  application main infrastructure setter
*/
import notApp from "./app.js";
/*
  user controllers
*/
import notController from "./controller.js";
import notRecord from "./record.js"; //  wrapper for data with server live interactions
import notInterface from "./interface.js"; //  wrapper for data with server live interactions

import {
    notTable,
    UIForm,
    notForm,
    notFormSet,
    notFormUtils,
    notBreadcrumbs,
    notTopMenu,
    notSideMenu,
} from "./components";

import notCRUD from "./crud/controller.crud.js";

const ncCRUD = notCRUD; //legacy alias

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
    notStores,
    notCRUD,
    ncCRUD,
    COMPONENTS,
    FIELDS,
    VARIANTS,
    notTable,
    UIForm,
    notForm,
    notFormSet,
    notFormUtils,
    notBreadcrumbs,
    notTopMenu,
    notSideMenu,
};
