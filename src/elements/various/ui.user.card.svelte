<script>
    import { onMount } from "svelte";
    import notCommon from "../../frame/common";

    export let id = "userCard";
    export let image = "https://bulma.io/images/placeholders/32x32.png";
    export let username = "John Doe";
    export let role = "admin";

    export let events = {}; //events to react on
    //register event handlers
    export let register = notCommon.registerWidgetEvents;
    //
    export let onUpdate = (data) => {
        if (Object.hasOwn(data, "username")) {
            username = data.username;
        }

        if (Object.hasOwn(data, "role")) {
            role = data.role;
        }
    };

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
