//raw svelte
import UIBreadcrumbs from './ui.breadcrumbs.svelte';
import UIError from './ui.error.svelte';
import UISideMenu from './ui.side.menu.svelte';
import UITag from './ui.tag.svelte';
import UIBooleans from './ui.booleans.svelte';
import UIButton from './ui.button.svelte';
import UIButtons from './ui.buttons.svelte';
import UIImages from './ui.images.svelte';
import UILinks from './ui.links.svelte';
//form related
import * as FormElements from './form/index.js';
//stores
import * as TableStores from './table/notTable.stores.js';
//wrappers
import Table from './table/notTable.js';
import Breadcrumbs from './breadcrumbs.js';
import SideMenu from './sidemenu.js';
import TopMenu from './topmenu.js';
import Menu from './menu.js';

import Form from './form.js';

Object.keys(FormElements).forEach((fieldtype)=>{
	Form.addComponent(fieldtype, FormElements[fieldtype]);
});

export {
	UIBreadcrumbs,
	UIError,
	UISideMenu,
	UITag,
	UIBooleans,
	UIButton,
	UIButtons,
	UIImages,
	UILinks,
	TableStores,
	Table,
	Breadcrumbs,
	SideMenu,
	TopMenu,
	Menu,
	Form,
	FormElements
};
