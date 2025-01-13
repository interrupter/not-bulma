<script>
    import { onMount } from "svelte";
    import notCommon from "../../frame/common";
    import { UIContent } from "../block";

    /**
     * @typedef {Object} Props
     * @property {string}       [id = "userCard"]
     * @property {string}       [image = "https://bulma.io/images/placeholders/32x32.png"]
     * @property {string}       [username = "John Doe"]
     * @property {string}       [role = "admin"]
     * @property {object}       [events = {}]
     * @property {function}     [register = notCommon.registerWidgetEvents] - register event handlers
     * @property {function}     [onUpdate = (data)=> {username=data.username; role = data.role;}]
     */

    /** @type {Props} */
    let {
        id = "userCard",
        image = "https://bulma.io/images/placeholders/32x32.png",
        username = "John Doe",
        role = "admin",
        events = {},
        register = notCommon.registerWidgetEvents.bind(notCommon),
        onUpdate = (data) => {
            if (Object.hasOwn(data, "username")) {
                username = data.username;
            }

            if (Object.hasOwn(data, "role")) {
                role = data.role;
            }
        },
    } = $props();

    export function getCompId() {
        return `usercard-${id}`;
    }

    export function getStandartUpdateEventName() {
        return `${getCompId()}:update`;
    }

    onMount(() => {
        if (!Object.hasOwn(events, getStandartUpdateEventName())) {
            events[getStandartUpdateEventName()] = onUpdate;
        }
        register(events);
    });
</script>

<article id={getCompId()} class="media">
    <figure class="media-left">
        <p class="image is-32x32">
            <img src={image} alt={username} />
        </p>
    </figure>
    <div class="media-content">
        <UIContent>
            <p>
                <strong>{username}</strong>
                <small>@</small>
                <strong>{role}</strong>
            </p>
        </UIContent>
    </div>
</article>
