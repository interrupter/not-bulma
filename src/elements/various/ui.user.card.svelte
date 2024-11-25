<script>
    import { onMount } from "svelte";
    import notCommon from "../../frame/common";


    
    
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [image]
     * @property {string} [username]
     * @property {string} [role]
     * @property {any} [events]
     * @property {any} [register] - register event handlers
     * @property {any} [onUpdate]
     */

    /** @type {Props} */
    let {
        id = "userCard",
        image = "https://bulma.io/images/placeholders/32x32.png",
        username = $bindable("John Doe"),
        role = $bindable("admin"),
        events = $bindable({}),
        register = notCommon.registerWidgetEvents,
        onUpdate = (data) => {
            if (Object.hasOwn(data, "username")) {
                username = data.username;
            }

            if (Object.hasOwn(data, "role")) {
                role = data.role;
            }
        }
    } = $props();

    function getCompId() {
        return `usercard-${id}`;
    }

    function getStandartUpdateEventName() {
        let compId = getCompId();
        return `${compId}:update`;
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
        <div class="content">
            <p>
                <strong>{username}</strong>
                <small>@</small>
                <strong>{role}</strong>
            </p>
        </div>
    </div>
</article>
