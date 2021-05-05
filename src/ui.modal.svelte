<script>
  let overlay;
  import UIOverlay from './ui.overlay.svelte';
  import UIBox from './ui.box.svelte';
  import UITitle from './ui.title.svelte';
  import UIContent from './ui.content.svelte';
  import UIButton from './ui.button.svelte';

  import {
    createEventDispatcher
  } from 'svelte';

  let dispatch = createEventDispatcher();

  export let closeButton = false;
	export let applyButton = false;
	export let show = false;
  export let loading = false;
	export let title = 'Modal window';
  export let subtitle = '';
  export let classes = '';

  export let WAITING_TEXT = 'Обработка';

</script>

<div class="pageloader {loading?'is-active':''}"><span class="title">{WAITING_TEXT}</span></div>

<UIOverlay show={true} closeOnClick={false} closeButton={false} >
  <UIBox {classes}>
      <UITitle size="2" {title} {subtitle} />
			<UIContent>
				<slot></slot>
				<div class="buttons is-grouped is-centered mt-4">
          {#if closeButton}
					<UIButton {...closeButton} />
          {/if}
          {#if applyButton}
					<UIButton {...applyButton} />
          {/if}
				</div>
			</UIContent>
	</UIBox>
</UIOverlay>
