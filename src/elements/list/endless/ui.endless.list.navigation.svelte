<script>
    import { UIButtonsRow } from "../../button";

    /**
     * @typedef {Object} Props
     * @property {number}   [page]                - current page
     * @property {number}   [pages]               - total count of pages
     * @property {any}      [buttonsRowComponent = UIButtonsRow] - buttons row ui svelte component
     * @property {object}   [buttonsRowComponentProps]   - buttons row component properties
     * @property {object}   [buttonPrevProps]   - prev button ui component properties
     * @property {object}   [buttonProgressProps]   - center/progress button ui component properties
     * @property {object}   [buttonNextProps]   - next button ui component properties
     * @property {function} [onnext]            - callback on next
     * @property {function} [onprev]            - callback on prev
     * @property    {string}    [progressTitleStart = '']  - prefix of progress button title
     * @property    {string}    [progressTitleDelimiter = ' / ']  - text that breaks numbers of current page and total count of pages
     * @property    {string}    [progressTitleEnd = '']  - suffix of progress button title
     */

    /** @type {Props} */
    let {
        page = 0,
        pages = 0,
        buttonsRowComponent: UIButtonsRowComponent = UIButtonsRow,
        buttonsRowComponentProps = {},
        buttonPrevProps = {
            title: "not-node:list_navigation_prev_button_label",
        },
        buttonProgressProps = {},
        buttonNextProps = {
            title: "not-node:list_navigation_next_button_label",
        },
        //this is placeholders for demonstration purposes only, `page` should be modified outside in onprev/onnext callbacks
        onprev = () => {
            page > 0 && page--;
        },
        onnext = () => {
            page < pages - 1 && page++;
        },
        progressTitleStart = "",
        progressTitleDelimiter = " / ",
        progressTitleEnd = "",
    } = $props();

    let currentPage = $derived(page + 1);
</script>

{#if pages > 0}
    <UIButtonsRowComponent
        {...buttonsRowComponentProps}
        left={currentPage > 1
            ? [
                  {
                      ...buttonPrevProps,
                      action: onprev,
                  },
              ]
            : []}
        center={pages > 1
            ? [
                  {
                      ...buttonProgressProps,
                      title: `${progressTitleStart}${currentPage}${progressTitleDelimiter}${pages}${progressTitleEnd}`,
                      disabled: true,
                  },
              ]
            : []}
        right={currentPage < pages
            ? [
                  {
                      ...buttonNextProps,
                      action: onnext,
                  },
              ]
            : []}
    />
{/if}
