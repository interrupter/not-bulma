
<script>
  /*import UIButton from './ui.button.svelte';
  export let values = [];
  export let centered = false;
  export let right = false;*/
  export let classes = '';
</script>

<div class="{classes}">
  <slot name="left"></slot>
  <slot name="center"></slot>
  <slot name="right"></slot>
</div>
