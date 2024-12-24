<script>
    import { onMount } from "svelte";
    import { UIButton } from "../button";
    import { LOCALE } from "../../locale";
    /**
     * @typedef {Object} Props
     * @property {boolean} [show]
     * @property {string} [message]
     * @property {string} [agree]
     */

    /** @type {Props} */
    let {
        show = $bindable(false),
        message = "Для улучшения работы сайта и его взаимодействия с пользователями мы используем файлы cookie. Продолжая работу с сайтом, Вы разрешаете использование cookie-файлов. Вы всегда можете отключить файлы cookie в настройках Вашего браузера.",
        agree = "Хорошо",
        cooldown = 31536000000,
    } = $props();

    onMount(() => {
        let cookieDate = localStorage.getItem("cookie_date");
        if (!cookieDate || +cookieDate + cooldown < Date.now()) {
            show = true;
        }
    });

    function accept() {
        localStorage.setItem("cookie_date", Date.now());
        show = false;
    }
</script>

{#if show}
    <div id="cookie_notification">
        <p>{$LOCALE[message]}</p>
        <UIButton onclick={accept} color="success" class="cookie_accept"
            >{$LOCALE[agree]}</UIButton
        >
    </div>
{/if}
