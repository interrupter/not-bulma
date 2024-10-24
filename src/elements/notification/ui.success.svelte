<script>
  import {LOCALE} from '../../locale';
  let { message, title } = $props();

</script>

<article class="message is-success">
  <div class="message-header">
    <p>{$LOCALE[title]}</p>
  </div>
  <div class="message-body">
    {$LOCALE[message]}
  </div>
</article>
