<script>
  import {LOCALE} from '../../locale';

  import UIOverlay from './ui.overlay.svelte';

  import UIBox from '../block/ui.box.svelte';
  import UIContent from '../block/ui.content.svelte';

  import UITitle from '../various/ui.title.svelte';
  import UIButton from '../button/ui.button.svelte';

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
