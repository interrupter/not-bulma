<script>
  import { run } from 'svelte/legacy';

    import { LOCALE } from "../../locale";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UICommon from "../common.js";
    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();
    const LC_ADD = "not-node:add_label";
    const LC_SELECT_FROM_LIST = "not-node:select_from_list_label";
    
    

    onMount(() => {
        clearValueFromDeadVariants();
    });





  /**
   * @typedef {Object} Props
   * @property {any} [value] - list of item ids
   * @property {boolean} [inputStarted]
   * @property {any} [variants]
   * @property {string} [fieldname]
   * @property {boolean} [readonly] - export let required = true;
   * @property {boolean} [valid]
   * @property {boolean} [validated]
   * @property {boolean} [errors]
   * @property {boolean} [formErrors]
   * @property {boolean} [formLevelError]
   * @property {any} [beforeAdd]
   * @property {any} [getItemId]
   * @property {any} [getItemTitle]
   * @property {any} [getItemType]
   * @property {any} [buildItem]
   */

  /** @type {Props} */
  let {
      value = $bindable([]),
      inputStarted = false,
      variants = [],
      fieldname = "tag",
      readonly = false,
      valid = true,
      validated = false,
      errors = false,
      formErrors = false,
      formLevelError = false,
      beforeAdd = (/*variant, variants*/) => {
          return true;
      },
      getItemId = (variant) => {
          return variant.id;
      },
      getItemTitle = (variant) => {
          return variant.title;
      },
      getItemType = (variant) => {
          return "info";
      },
      buildItem = (variant) => {
          return {
              id: getItemId(variant),
              title: getItemTitle(variant),
              type: getItemType(variant),
          };
      }
  } = $props();

    function variantIdToVariant(id) {
        return variants.find((variant) => getItemId(variant) === id);
    }

    function changeEvent() {
        let data = {
            field: fieldname,
            value,
        };
        dispatch("change", data);
    }

    function remove(e) {
        e && e.preventDefault();
        let id = e.currentTarget.dataset.id;
        if (value.includes(id)) {
            value.splice(value.indexOf(id), 1);
            value = value;
            changeEvent();
        }
        return false;
    }

    function add(e) {
        e && e.preventDefault();
        let id = e.currentTarget.parentNode.querySelector("select").value;
        const variant = variantIdToVariant(id);
        if (!variant) {
            return false;
        }
        if (!beforeAdd(variant, variants)) {
            return false;
        }
        if (id && value.indexOf(id) === -1) {
            value.push(id);
            value = value;
            changeEvent();
        }
        return false;
    }

    function clearValueFromDeadVariants() {
        value = value.filter((id) => {
            return variantIdToVariant(id);
        });
        return value;
    }

    /*
item = {
  id,        //unique
  title,     //some text
  type       //for coloring items, usual html template names danger, success, etc
}
*/
    let items = $derived(value
        .map(variantIdToVariant)
        .filter((variant) => variant)
        .map(buildItem));
    let allErrors;
  run(() => {
      allErrors = [].concat(
          errors ? errors : [],
          formErrors ? formErrors : []
      );
  });
    let showErrors;
  run(() => {
      showErrors = !(validated && valid) && inputStarted;
  });
    let invalid = $derived(valid === false || formLevelError);
    let validationClasses;
  run(() => {
      validationClasses =
          valid === true || !inputStarted
              ? UICommon.CLASS_OK
              : UICommon.CLASS_ERR;
  });
</script>

<div class="control columns">
    <div class="column {validationClasses}">
        {#each items as item (item.id)}
            <span class="mx-1 tag is-{item.type}"
                >{$LOCALE[item.title]}
                {#if !readonly}
                    <button
                        data-id={item.id}
                        class="delete is-small"
                        onclick={remove}
></button>
                {/if}
            </span>
        {/each}
    </div>
    {#if !readonly}
        <div class="column">
            <div class="control">
                <div class="select is-small">
                    <select>
                        <option value="-1" selected
                            >{$LOCALE[LC_SELECT_FROM_LIST]}</option
                        >
                        {#each variants as variant}
                            <option value={variant.id}
                                >{$LOCALE[variant.title]}</option
                            >
                        {/each}
                    </select>
                </div>
                <button class="button is-primary is-small" onclick={add}
                    >{$LOCALE[LC_ADD]}</button
                >
            </div>
        </div>
    {/if}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
