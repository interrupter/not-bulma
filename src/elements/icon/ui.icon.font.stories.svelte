<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import UIIconFont from "./ui.icon.font.svelte";
    import { fn } from "storybook/test";

    // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
    const { Story } = defineMeta({
        title: "Elements/Icons/UIIconFont",
        component: UIIconFont,
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
            side: {
                control: "radio",
                options: ["", "left", "right"],
            },
            pointable: {
                type: "checkbox",
            },
        },
        args: {
            onclick: fn(),
        },
    });
</script>

<!-- More on writing stories with args: https://storybook.js.org/docs/writing-stories/args -->
<Story name="IconFont" args={{ font: "cross", title: "IconFont", size: "" }} />
<Story
    name="IconFont pointable"
    args={{ font: "cross", title: "IconFont", pointable: true }}
/>
<Story
    name="IconFont left"
    args={{ font: "cross", title: "IconFont", side: "left" }}
/>
<Story
    name="IconFont right"
    args={{ font: "cross", title: "IconFont", side: "right" }}
/>
