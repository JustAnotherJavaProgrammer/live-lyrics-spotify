<script lang="ts">
    import type { Writable } from "svelte/store";

    export let pbs: Writable<SpotifyApi.CurrentPlaybackResponse>;
    let playbackState: SpotifyApi.CurrentPlaybackResponse;
    pbs.subscribe((p) => (playbackState = p));
</script>

<article>
    {#if !playbackState?.item}
        Live lyrics here
    {:else}
         TODO
    {/if}
</article>

<style>
    article {
        box-sizing: border-box;
        flex: 0 1 80vh;
        max-height: 80vh;
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        font-weight: 600;
        font-size: max(7.5vmin, 2em);
        text-align: center;
    }
</style>
