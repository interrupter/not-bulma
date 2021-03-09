<script>
  import {onMount} from 'svelte';
  import UIButton from './ui.button.svelte';

  export let top = '2em';
  export let left = '2em';
  export let right;
  export let bottom;
  export let direction = 'left';  //left/right/top/bottom/around

  export let trigger = {
    title:  'Click me!',
    icon:   'plus',
    color:  'primary',
    size:   'medium'
  };

  function toggle(){

  }

  let positionStyle = '';

  onMount(()=>{
    position = '';
  });

</script>

<div class="is-fab" style="{positionStyle}">
<UIButton action={toggle} {...trigger} />
</div>

<style>
  .is-fab{
    position: absolute;
  }
</style>
