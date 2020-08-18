const
	//interface
	OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY = ['_id', 'id', 'ID'],
	DEFAULT_FILTER = {},
	DEFAULT_SEARCH = '',
	DEFAULT_RETURN = {},
	DEFAULT_PAGE_NUMBER = 1,
	DEFAULT_PAGE_SIZE = 10,
	//record
	META_INTERFACE = Symbol('interface'),
	META_MAP_TO_INTERFACE = [
		'getActionsCount',
		'getActions',
		'setFindBy',
		'resetFilter',
		'setFilter',
		'getFilter',
		'setSorter',
		'getSorter',
		'resetSorter',
		'setPageNumber',
		'setPageSize',
		'setPager',
		'setReturn',
		'setSearch',
		'getSearch',
		'resetSearch',
		'resetPager',
		'getPager',
		'addFormFieldType',
		'addFormField',
		'getFieldTypes',
		'getActionFormFields'
	],
	DEFAULT_ACTION_PREFIX = '$';

export {
	OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY,
	DEFAULT_FILTER,
	DEFAULT_PAGE_NUMBER,
	DEFAULT_PAGE_SIZE,
	DEFAULT_SEARCH,
	DEFAULT_RETURN,
	META_INTERFACE,
	META_MAP_TO_INTERFACE,
	DEFAULT_ACTION_PREFIX
};
