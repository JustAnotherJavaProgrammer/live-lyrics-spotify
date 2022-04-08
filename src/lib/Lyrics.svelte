<script lang="ts">
import { onDestroy, onMount } from "svelte";

    import { get, Writable } from "svelte/store";
    import type { LyricLine } from "./lyrics";
    import getLyrics from "./lyrics";

    export let pbs: Writable<SpotifyApi.CurrentPlaybackResponse>;
    let playbackState: SpotifyApi.CurrentPlaybackResponse;
    let lastId: string = null;
    pbs.subscribe(updateLyrics);
    let lyrics: LyricLine[] | null;
    async function updateLyrics(p: SpotifyApi.CurrentPlaybackResponse) {
        playbackState = p;
        if (playbackState?.item?.id !== lastId) {
            lastId = playbackState?.item?.id;
            lyrics = await getLyrics(playbackState?.item?.name + " " + playbackState?.item?.artists?.map((a) => a.name).join(", "));
        }
    }
    updateLyrics(get(pbs));

    onMount(() => {
        // Initiate setting lines to active
    });
    onDestroy(() => {
        // Clear intervals and timeouts
    });
</script>

<article>
    {#if !playbackState?.item}
        Start playing something on Spotify to see the lyrics
    {:else if lyrics == null}
        No lyrics available
    {:else}
        {#each lyrics as line}
            <span class="line">{line.lyrics}</span>
        {/each}
    {/if}
</article>

<style>
    article {
        box-sizing: border-box;
        flex: 1 1 80vh;
        /* max-height: 80vh; */
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        font-weight: 600;
        font-size: max(7.5vmin, 2em);
        text-align: center;
        overflow-y: auto;
        /* align-self: center; */
    }

    .line {
        display: block;
        color: white;
        transition: background-color 0.25s;
        transition: color 0.25s;
        padding: 0.25em;
        border-radius: 0.5em;
    }

    .line.active {
        background-color: white;
        color: black;
        mix-blend-mode: screen;
    }
</style>
