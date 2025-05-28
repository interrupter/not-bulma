/**
 * @typedef {string|number} VariantId
 */

/**
 * @typedef     {object}    Variant
 * @property    {VariantId}         id
 * @property    {string|object}     title
 * @property    {string|object}     description
 * @property    {string|object}     image
 * @property    {object}            value
 */

/**
 * @typedef {array<Variant>}    Variants
 */

/**
 * @typedef {object}    VariantsGroup
 * @property {VariantId}        id
 * @property {string|object}    title
 * @property {string|object}    image
 * @property {Variants}         variants
 */

/**
 * @typedef {array<VariantsGroup>}  VariantsGroups
 */

/**
 * @typedef {object} SelectedVariant
 * @property {VariantId}    groupId
 * @property {VariantId}    valueId
 */

/**
 * @typedef {object.<string|number,array<VariantId>>} SelectedVariants
 */

/**
 * @typedef {object.<string|number,array<Variant>>} SelectedValues
 */

/**
 * @typedef {object}    ItemIds
 * @property {number}   groupId
 * @property {number}   valueId
 */
/**
 * @typedef {object} ItemIndexes
 * @property {number}    groupIndex
 * @property {number}    itemIndex
 */

/**
 * @typedef {object}       SelectorItem
 * @property {VariantId}    id
 * @property {srting}       title
 * @property {Variant}      value
 */

/**
 * @typedef {array<SelectorItem>}  SelectorItems
 */

/**
 * @typedef {string}  SelectorGroupTitle
 */

/**
 * @typedef {string}  SelectorGroupImage
 */

/**
 * @typedef {object}    SelectorGroupDescription
 * @property {SelectorItems} values
 */

/**
 * @typedef {object}       SelectorGroup
 * @property {VariantId}    id
 * @property {SelectorGroupTitle}       title
 * @property {SelectorGroupImage}       image
 * @property {SelectorGroupDescription} description
 */

/**
 * @typedef {array<SelectorGroup>}  SelectorGroups
 */

/**
 *
 * @interface IListSelectWithGroupsBehaviour
 */

/**
 *
 * @method
 * @static
 * @name IListSelectWithGroupsBehaviour#countOfSelected
 * @param {object} parent
 * @param {object}  props
 * @param {SelectedVariant}  props.variantSelected
 * @returns {number}
 */

/**
 * @typedef {object}       UIChanges
 * @property {SelectedVariant | undefined}  on
 * @property {SelectedVariant | undefined}  off
 */

/**
 * @typedef {Object} ListGroupsOptions
 * @property {boolean} multiple
 * @property {boolean} onlyOnePerGroup
 * @property {boolean} atLeastOne
 */
export default {};
