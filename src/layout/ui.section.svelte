<script>
  export let size; //medium, large
</script>

<section class="section {size?('is-'+size):''}">
  <slot></slot>
</section>
