<script>
    export let value;
    export let max = 100;
    export let color = "";
    export let size = "";
    export let classes = "";
</script>

<progress
    class="
  progress
  {classes}
  {color ? `is-${color}` : ''}
  {size ? `is-${size}` : ''}"
    {value}
    {max}>{value}%</progress
>
