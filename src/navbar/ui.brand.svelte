<script>
  import UIIcon from '../ui.icon.svelte';
  export let url = '/';
  export let title = '';
  export let icon = {
    src: 'https://via.placeholder.com/56x28',
    width: 28,
    height: 56
  };
</script>


<a class="navbar-item" href="{url}">
  <UIIcon {...icon}></UIIcon>{title?` ${title}`:''}
</a>
