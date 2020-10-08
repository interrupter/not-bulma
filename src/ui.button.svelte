<script>
  export let title = '';
  export let light = false;
  export let loading = false;
  export let raised = false;
  export let outlined = false;
  export let inverted = false;
  export let rounded = false;
  export let state = '';
  export let type = '';
  export let color = '';
  export let size = '';
  export let classes = '';
  export let icon = false;
  export let action = ()=>{ return true; }
</script>


<button on:click="{action}" class="button {classes} {state?`is-${state}`:''} {inverted?`is-inverted`:''} {outlined?`is-outlined`:''} {raised?`is-raised`:''} {rounded?`is-rounded`:''} {light?`is-light`:''} {loading?`is-loading`:''} {color?`is-${color}`:''} {type?`is-${type}`:''} {size?`is-${size}`:''}">
  {title}
  {#if icon }
  <span class="icon"><i class="fas fa-{icon}"></i></span>
  {/if}
</button>
