<script>
  import { createEventDispatcher } from 'svelte';
  let dispatch = createEventDispatcher();

  export let state = 'light';
  export let labels = {
    black: 'black',
    dark: 'dark',
    light: 'light',
    white: 'white',
    primary: 'primary',
    link: 'link',
    info: 'info',
    success: 'success',
    warning: 'warning',
    danger: 'danger'
  };

</script>

<span class="tag is-{state}">{labels[state]}</span>
