<script>
    import { LOCALE } from "../../locale";
    let { message, title, class: classes = "" } = $props();
</script>

<article class="message is-success {classes}">
    <div class="message-header">
        <p>{$LOCALE[title]}</p>
    </div>
    <div class="message-body">
        {$LOCALE[message]}
    </div>
</article>
