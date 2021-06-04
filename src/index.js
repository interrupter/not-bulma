import './scss/style.scss';
//raw svelte
import UIBox from './ui.box.svelte';
import UIBlock from './ui.block.svelte';
import UIContent from './ui.content.svelte';
import UITitle from './ui.title.svelte';
import UIModal from './ui.modal.svelte';

import UIOverlay from './ui.overlay.svelte';
import UIBreadcrumbs from './ui.breadcrumbs.svelte';
import UIProgress from './ui.progress.svelte';
import UIUserCard from './ui.user.card.svelte';
import UIError from './ui.error.svelte';
import UISuccess from './ui.success.svelte';
import UISideMenu from './sidemenu/ui.side.menu.svelte';
import UISideMenuBurger from './sidemenu/ui.burger.svelte';
import UITag from './ui.tag.svelte';
import UIBooleans from './ui.booleans.svelte';
import UIButton from './ui.button.svelte';
import UIButtons from './ui.buttons.svelte';
import UIImages from './ui.images.svelte';
import UILinks from './ui.links.svelte';
import UILink from './ui.link.svelte';
import UIIcon from './ui.icon.svelte';
import UIIconFont from './ui.icon.font.svelte';
import UIIconFloating from './ui.icon.floating.svelte';
import UICookiesNotification from './ui.cookie.notification.svelte';
//form related
import * as FormElements from './form/index.js';
//stores
import * as Stores from './stores.js';
//wrappers
import Table from './table/notTable.js';
import Breadcrumbs from './breadcrumbs.js';
import SideMenu from './sidemenu.js';
import TopMenu from './topmenu.js';
import Menu from './menu.js';

import Form from './form.js';
import * as LIB from './form/LIB.js';
import * as Frame from './frame';

import * as Layout from './layout';

import ncCRUD from './ncCRUD.js';

import UISampleFilter from './various/filter.svelte';

import {
  default as UICommon
} from './common.js';

Object.keys(FormElements).forEach((fieldtype) => {
  Form.addComponent(fieldtype, FormElements[fieldtype]);
});

const
  notCommon = Frame.notCommon,
  notPath = Frame.notPath,
  notController = Frame.notController,
  notBase = Frame.notBase,
  notRouter = Frame.notRouter,
  notRecord = Frame.notRecord,
  notInterface = Frame.notInterface,
  notApp = Frame.notApp,
  notAppComponents = Frame.COMPONENTS,
  notAPI = Frame.notAPI;

Frame.COMPONENTS.add('UIProgress', UIProgress);
Frame.COMPONENTS.add('UIUserCard', UIUserCard);
Frame.COMPONENTS.add('UISideMenuBurger', UISideMenuBurger);
Frame.COMPONENTS.add('UISampleFilter', UISampleFilter);

const {
  UIAutocomplete,
  UIForm,
  UIField,
  UILabel,
  UICheckbox,
  UICheckboxList,
  UIColor,
  UIDate,
  UIEmail,
  UIHidden,
  UIPassword,
  UIRadio,
  UIRadiogroup,
  UIRange,
  UISelect,
  UISlider,
  UISwitch,
  UITelephone,
  UITextarea,
  UITextfield,
  UITagControl
} = FormElements;


import {LOCALE, say} from './locale.js';

export {
  UISampleFilter,
  UIBox, UIBlock, UIContent, UITitle, UIModal,
  LIB,
  UIAutocomplete,
  UIForm,
  UIField,
  UILabel,
  UICookiesNotification,
  UICheckbox,
  UICheckboxList,
  UIColor,
  UIDate,
  UIEmail,
  UIHidden,
  UIPassword,
  UIRadio,
  UIRadiogroup,
  UIRange,
  UISelect,
  UISlider,
  UISwitch,
  UITelephone,
  UITextarea,
  UITextfield,
  UIOverlay,
  UIBreadcrumbs,
  UIError,
  UITag,
  UISuccess,
  UISideMenu,
  UITagControl,
  UIBooleans,
  UIButton,
  UIButtons,
  UIImages,
  UILinks,
  UILink,
  UIIcon,
  UIIconFont,
  UIIconFloating,
  UIProgress,
  Stores,
  Table,
  Breadcrumbs,
  SideMenu,
  TopMenu,
  Menu,
  Form,
  FormElements,
  UICommon,
  ncCRUD,
  Frame,
  Layout,
  notCommon,
  notPath,
  notController,
  notBase,
  notRouter,
  notRecord,
  notInterface,
  notApp,
  notAppComponents,
  notAPI,
  //not-locale module shortcuts
  say,    //to render phrase
  LOCALE  // writable custom svelte/store for current dictionary
};
