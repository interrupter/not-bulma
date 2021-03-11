<script>
  import UIButton from './ui.button.svelte';
  import UITagSimple from './ui.tag.simple.svelte';
  export let button = {};
  export let tag = {};

</script>


<UIButton {...button} />
<UITagSimple {...tag} classes="is-top-right" />
