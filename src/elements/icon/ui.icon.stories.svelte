<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import UIIcon from "./ui.icon.svelte";
    import { fn } from "storybook/test";

    // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
    const { Story } = defineMeta({
        title: "Elements/Icons/UIIcon",
        component: UIIcon,
        tags: ["autodocs"],
        argTypes: {
            title: {
                type: "text",
            },
            size: {
                control: "radio",
                options: ["", "small", "medium", "large"],
            },
            font: {
                type: "text",
            },
            svg: {
                type: "text",
            },
            src: {
                type: "text",
            },
            width: {
                type: "text",
            },
            height: {
                type: "text",
            },
        },
        args: {
            onclick: fn(),
        },
    });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="Icon" args={{ font: "cross", title: "Icon", size: "" }} />
