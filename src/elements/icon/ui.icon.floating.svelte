<script>
  import {onMount} from 'svelte';
  import UIButton from '../button/ui.button.svelte';

  //export let top = '2em';
  //export let left = '2em';
  //export let right;
  //export let bottom;
  

  /**
   * @typedef {Object} Props
   * @property {any} [trigger] - export let direction = 'left';  //left/right/top/bottom/around
   */

  /** @type {Props} */
  let { trigger = {
    title:  'Click me!',
    icon:   'plus',
    color:  'primary',
    size:   'medium'
  } } = $props();

  function toggle(){

  }

  let positionStyle = $state('');

  onMount(()=>{
    positionStyle = '';
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
