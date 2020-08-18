<script>
  
  export let value = '';
  export let fieldname = 'hidden';
  export let required = true;
  export let readonly = false;

</script>

<input type="hidden" bind:value="{value}" {required} {readonly} name="{fieldname}"/>
