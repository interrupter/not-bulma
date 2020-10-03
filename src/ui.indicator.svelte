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
  export let classes = 'mx-1';

</script>

<span class="tag is-{state} {classes}">{labels[state]}</span>
