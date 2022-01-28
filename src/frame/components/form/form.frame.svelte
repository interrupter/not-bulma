<script>

  import {
    DEFAULT_STATUS_SUCCESS,
    DEFAULT_STATUS_ERROR
  } from './const';

  import {LOCALE} from '../../../locale';
  import LockBlockComponent from './lock.block.svelte';

  import UISuccess from '../../../elements/notification/ui.success.svelte';
  import UIError from '../../../elements/notification/ui.error.svelte';
  import UIButtons from '../../../elements/button/ui.buttons.svelte';

  import {
    createEventDispatcher,
    onMount
  } from 'svelte';

  let dispatch = createEventDispatcher();

  export let name = 'default-form';
  export let status = '';
  export let message = false;

  export let showModes = false;
  export let MODES = [];
  export let mode = 'default';

  export let loading = false;

  export let MODES_TITLES = {};

  function setMode(val) {
    mode = val;
    dispatch('mode', val);
    updateModesButtons();
  }

  let MODES_BUTTONS = [];

  function updateModesButtons() {
    MODES_BUTTONS = MODES.filter(thisMode => {
      return (mode !== thisMode);
    }).map(thisMode => {
      return {
        title: MODES_TITLES[thisMode],
        outlined: true,
        type: 'link',
        action() {
          setMode(thisMode);
        }
      };
    });
    MODES_BUTTONS = MODES_BUTTONS;
  }

  onMount(() => {
    updateModesButtons();
  });

</script>

<div class="block-container" id="{name}-frame">
  <LockBlockComponent bind:enable={loading}></LockBlockComponent>
  {#if status === DEFAULT_STATUS_SUCCESS }
  <UISuccess title="" message={message}></UISuccess>
  {:else}
  <div class="form-paper"  id="{name}-frame-form-container"></div>
  {#if status === DEFAULT_STATUS_ERROR }
  <UIError title="" message={message}></UIError>
  {/if}
  {#if showModes}
  <UIButtons centered={true} bind:values={MODES_BUTTONS} classes={'mt-4'} />
  {/if}
  {/if}
</div>
