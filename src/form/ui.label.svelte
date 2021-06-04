<script>
  import {LOCALE} from '../locale';

  export let id;
  export let label = 'label';
</script>


<label class="label" for={id}>{$LOCALE[label]}</label>
