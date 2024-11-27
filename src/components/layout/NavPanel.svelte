<script lang="ts">
    type ButtonData = {
        name: string;
        view: string;
    };

    export let buttons: ButtonData[] = [];
    export let activeView: string = 'profile';

    const setActive = (view: string) => {
        dispatch('navigate', { view });
    };

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

<div class="flex border-b border-gray-300">
    {#each buttons as { name, view }}
        <button
            class="flex-1 px-4 py-2 text-center text-sm font-medium transition-colors duration-300
                 border-b-2 focus:outline-none
                 {activeView === view
                    ? 'border-blue-500 text-blue-700'
                    : 'border-transparent text-gray-600 hover:text-blue-500'}"
            on:click={() => setActive(view)}
        >
            {name}
        </button>
    {/each}
</div>
