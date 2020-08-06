<script>

  export let inputStarted = false;  
  export let value = '';
  export let label = 'hidden';
  export let placeholder = 'input some text here, please';
  export let fieldname = 'hidden';
  export let icon = false;
  export let rows = 10;
  export let required = true;
  export let readonly = false;
  export let valid = true;
  export let validated = false;
  export let errors = false;
  export let formErrors = false;
  export let formLevelError = false;

</script>

<input type="hidden" bind:value="{value}" {readonly} name="{fieldname}"/>
