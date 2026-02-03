<script>
  import UIButton from '../button/ui.button.svelte';
  import UITag from '../various/ui.tag.svelte';
  let { button = {}, tag = {} } = $props();

</script>

<UIButton {...button} />
<UITag {...tag} classes="is-top-right" />
