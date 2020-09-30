<script>

  export let state = '';
  export let title = '';
  export let light = false;
  export let type = '';
  export let size = '';
  export let icon = false;
  export let action = ()=>{ return true; }

  $: classes = (state&&state.length>0?(` is-${state} `):'')+(light?(` is-light `):'')+(type&&type.length>0?(` is-${type} `):'')+(size&&size.length>0?(` is-${size} `):'');

</script>


<button on:click="{action}" class="button {classes}">
  {title}
  {#if icon}
  <span class="icon">
    <i class="fas fa-{icon}"></i>
  </span>
  {/if}
</button>
