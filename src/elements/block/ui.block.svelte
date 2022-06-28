<script>
  export let id='';
  export let classes = '';
</script>

<div {id} class="block {classes}" on:click >
  <slot></slot>
</div>
