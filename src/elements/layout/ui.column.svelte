<script>
  export let classes = "";
  export let title = "";
</script>

<div {title} class="column {classes}">
  <slot></slot>
</div>
