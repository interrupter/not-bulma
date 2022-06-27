<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    import UITextfield from "../form/ui.textfield.svelte";

    import {LOCALE} from '../../locale';

    export let placeholder = $LOCALE['not-node:field_search_placeholder'];
    export let term = '';

    function onChange({detail}){
        dispatch('termChange', detail); 
    }

</script>

<div class="columns">
    <div class="column">
        <div class="field">
            <UITextfield 
                bind:value={term}
                {placeholder}
                fieldname='searchTermInput'
                icon='magnifying-glass'
                on:change={onChange}
            />
        </div>
    </div>
</div>
