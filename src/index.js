import './style.scss';
//raw svelte
import UIOverlay from './ui.overlay.svelte';
import UIBreadcrumbs from './ui.breadcrumbs.svelte';
import UIError from './ui.error.svelte';
import UISuccess from './ui.success.svelte';
import UISideMenu from './ui.side.menu.svelte';
import UITag from './ui.tag.svelte';
import UIBooleans from './ui.booleans.svelte';
import UIButton from './ui.button.svelte';
import UIButtons from './ui.buttons.svelte';
import UIImages from './ui.images.svelte';
import UILinks from './ui.links.svelte';
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

import ncCRUD from './ncCRUD.js';

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
	notAPI = Frame.notAPI;

const {
	UIForm,
	UIField,
	UILabel,
	UICheckbox,
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
	UITextfield
} = FormElements;

export {
	LIB,
	UIForm,
	UIField,
	UILabel,
	UICookiesNotification,
	UICheckbox,
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
	UISuccess,
	UISideMenu,
	UITag,
	UIBooleans,
	UIButton,
	UIButtons,
	UIImages,
	UILinks,
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
	notCommon,
	notPath,
	notController,
	notBase,
	notRouter,
	notRecord,
	notInterface,
	notApp,
	notAPI
};
