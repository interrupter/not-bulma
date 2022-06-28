<script>

  export let id='';
  export let classes = '';

</script>

<div {id} class="box {classes} " on:click >
  <slot></slot>
</div>
