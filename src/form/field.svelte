<script>
  import UICommon from '../common.js';
  import UILabel from './ui.label.svelte';
  import {
    FIELDS,
    COMPONENTS,
    VARIANTS
  } from './LIB.js';

  import {
    createEventDispatcher,
    onMount
	} from 'svelte';
	let dispatch = createEventDispatcher()

  export let label = '';
  export let name = 'generic field';
  export let readonly = false;
  export let horizontal = false;
  export let controls = [];
  //field style modification
  export let classes = '';
  ////addons
  export let addons = false;
  export let addonsCentered = false;
  export let addonsRight = false;
  ////gorup
  export let grouped = false;
  export let groupedMultiline = false;
  export let groupedRight = false;
  export let groupedCentered = false;

  let fieldClasses = '';

  onMount(()=>{
    fieldClasses+=(' ' + classes);
    fieldClasses+=(addons?' has-addons ':'');
    fieldClasses+=(addonsCentered?' has-addons-centered ':'');
    fieldClasses+=(addonsRight?' has-addons-right ':'');

    fieldClasses+=(grouped?' is-grouped ':'');
    fieldClasses+=(groupedMultiline?' is-grouped-multiline ':'');
    fieldClasses+=(groupedRight?' is-grouped-right ':'');
    fieldClasses+=(groupedCentered?' is-grouped-centered ':'');
    if(readonly){
      controls.forEach((control) => {control.readonly = true;});
    }
  });

  function onControlChange(ev){
    let data = ev.detail;
    dispatch('change', data);
  }

</script>

{#if horizontal}
<div class="field is-horizontal {fieldClasses}">
  <div class="field-label">{label}</div>
  <div class="field-body">
    {#each controls as control}
    <svelte:component this={COMPONENTS.get(control.component)} {...control} on:change={onControlChange} fieldname={name} />
    {/each}
  </div>
</div>
{:else}
<div class="field {fieldClasses}">
  {#each controls as control}
  <UILabel id="form-field-{control.component}-{name}" label={control.label} />
  <svelte:component this={COMPONENTS.get(control.component)} {...control} on:change={onControlChange} fieldname={name} />
  {/each}
</div>
{/if}
