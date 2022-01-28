<script>
  import UIButton from '../button/ui.button.svelte';
  import UITag from '../various/ui.tag.svelte';
  export let button = {};
  export let tag = {};

</script>

<UIButton {...button} />
<UITag {...tag} classes="is-top-right" />
