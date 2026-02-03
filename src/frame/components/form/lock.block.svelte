<script>
    /**
     * @typedef {Object} Props
     * @property {boolean} [enable]
     * @property {string} [backgroundColor]
     */

    /** @type {Props} */
    let { enable = false, backgroundColor = "#337ab7" } = $props();
    let style = $derived(`background-color: ${backgroundColor};`);
</script>

<div id="block-shield" class:show={enable} {style}>
    <div class="loader"></div>
</div>

<style>
    #block-shield {
        display: none;
    }

    div.show {
        display: block !important;
        width: 100%;
        height: 100%;
        left: 0;
        position: absolute;
        top: 0;
        z-index: 10000000;
    }

    .loader,
    .loader:after {
        border-radius: 50%;
        height: 10em;
        width: 10em;
    }

    .loader {
        -webkit-animation: load8 1.1s infinite linear;
        -webkit-transform: translateZ(0);
        animation: load8 1.1s infinite linear;
        border: 1.1em solid hsla(0, 0%, 100%, 0.2);
        border-left: 1.1em solid #fff;
        font-size: 10px;
        margin: 60px auto;
        position: relative;
        text-indent: -9999em;
        transform: translateZ(0);
    }

    @-webkit-keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }

        to {
            -webkit-transform: rotate(1turn);
            transform: rotate(1turn);
        }
    }

    @keyframes load8 {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }

        to {
            -webkit-transform: rotate(1turn);
            transform: rotate(1turn);
        }
    }
</style>
