<script>
  import {LOCALE} from './locale';
  import UIOverlay from './ui.overlay.svelte';
  import UIBox from './ui.box.svelte';
  import UITitle from './ui.title.svelte';
  import UIContent from './ui.content.svelte';
  import UIButton from './ui.button.svelte';

  export let closeButton = false;
  export let applyButton = false;
  export let show = false;
  export let loading = false;
  export let title = 'Modal window';
  export let subtitle = '';
  export let classes = '';

  export let WAITING_TEXT = 'Обработка';

</script>

<UIOverlay {show} closeOnClick={false} closeButton={false} >
  <UIBox {classes}>
      <UITitle size="2" title={$LOCALE[title]} subtitle={$LOCALE[subtitle]} />
			<UIContent>
        <div class="pageloader {loading?'is-active':''}"><span class="title">{$LOCALE[WAITING_TEXT]}</span></div>
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
