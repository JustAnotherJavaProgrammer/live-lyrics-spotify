<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount, tick } from "svelte";

    import { get, Writable } from "svelte/store";
    import type { LyricLine } from "./lyrics";
    import getLyrics from "./lyrics";
    import { currentPlaybackPosition } from "./playback";

    // Scrolling polyfill
    import { elementScrollIntoViewPolyfill } from "seamless-scroll-polyfill";
    import { isAnyVisible } from "./visibility";
    elementScrollIntoViewPolyfill();
    let interval: number;

    const dispatch = createEventDispatcher();

    export let pbs: Writable<SpotifyApi.CurrentPlaybackResponse>;
    let playbackState: SpotifyApi.CurrentPlaybackResponse;
    let lastId: string = null;
    let lyrics: LyricLine[] | null | "" | 403;
    async function updateLyrics(p: SpotifyApi.CurrentPlaybackResponse) {
        if (p === undefined) return;
        const lyricsChanged = p?.item?.id !== lastId || (p?.is_playing && !playbackState?.is_playing) || lyrics === 403;
        playbackState = p;
        if (lyricsChanged) {
            lyrics = "";
            lastId = playbackState?.item?.id;
            lyrics = await getLyrics(playbackState?.item?.name + " " + playbackState?.item?.artists?.map((a) => a.name).join(", "));
            if (lyrics === null) lyrics = await getLyrics(playbackState?.item?.name);
            console.log(lyrics);
            // if (lyrics != null) {
            //     for (const line of lyrics) {
            //         line.seconds += 1;
            //     }
            // }
        }
        tick().then(() => updateActive(lyricsChanged));
    }
    updateLyrics(get(pbs));
    pbs.subscribe(updateLyrics);

    let linesList: HTMLElement;

    async function updateActive(ignoreVisibility = false) {
        // console.log(Date.now(), "updateActive");
        if (linesList == null) {
            console.warn("linesList == null");
            linesList = document.getElementById("lines-list");
            if (linesList == null) {
                console.warn("linesList not found by id");
                return;
            }
        }
        if (lyrics == null || lyrics == "" || lyrics === 403) return;
        const currentPosition = currentPlaybackPosition(playbackState);
        // console.log("currentPosition", currentPosition);
        const sec = Math.floor(currentPosition / 1000);
        // console.log("sec%60", sec % 60);
        const activeIndex = lyrics.findIndex((l, i) => l.seconds <= sec && (i + 1 >= (lyrics as LyricLine[]).length || (lyrics[i + 1] as LyricLine).seconds > sec));
        // console.log(sec, activeIndex);
        const prevActive = linesList.getElementsByClassName("active")[0];
        if (prevActive != null) {
            const prevIndex = parseInt(prevActive.id.substring(5));
            if (prevIndex == activeIndex) return scheduleNextUpdate(activeIndex, currentPosition, lyrics);
            prevActive.classList.remove("active");
        }
        if (activeIndex == -1) return scheduleNextUpdate(activeIndex, currentPosition, lyrics);
        const newActive = document.getElementById("line-" + activeIndex);
        if (newActive != null) {
            newActive.classList.add("active");
            if (ignoreVisibility || (await isAnyVisible([newActive, prevActive]))) {
                // console.log("Scroll into view");
                newActive.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            //  else {
            //     console.log("Don't scroll into view (not visible)");
            // }
        }
        scheduleNextUpdate(activeIndex, currentPosition, lyrics);
    }
    function scheduleNextUpdate(activeIndex: number, currentPosition: number, lyrics: LyricLine[]) {
        if (activeIndex < lyrics.length - 1) {
            if (interval != undefined) window.clearTimeout(interval);
            const nextUpdate = Math.max(lyrics[activeIndex + 1].seconds * 1000 - currentPosition, 1);
            // console.info("nextUpdate", nextUpdate);
            interval = window.setTimeout(updateActive, nextUpdate);
        }
    }

    function scrollToActive() {
        if (linesList == null) {
            linesList = document.getElementById("lines-list");
            if (linesList == null) return;
        }
        const active = linesList.getElementsByClassName("active")[0];
        if (active == null) return;
        active.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function handleVisibilityChange() {
        if (document.visibilityState !== "hidden") {
            scrollToActive();
        }
    }

    onMount(() => {
        updateActive();
        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleVisibilityChange);
        window.addEventListener("resize", handleVisibilityChange);
    });
    onDestroy(() => {
        console.warn("Lyrics destroyed");
        if (interval != undefined) window.clearTimeout(interval);
        document.removeEventListener("visibilitychange", handleVisibilityChange);
        document.removeEventListener("fullscreenchange", handleVisibilityChange);
        window.removeEventListener("resize", handleVisibilityChange);
    });

    function skipToLine(
        event: MouseEvent & {
            currentTarget: EventTarget & HTMLSpanElement;
        }
    ) {
        const line = event.currentTarget;
        if (!line.id.startsWith("line-")) return;
        const index = parseInt(line.id.substring(5));
        if (!Array.isArray(lyrics) || index < 0 || index >= lyrics.length) return;
        const newProgress = (lyrics[index] as unknown as LyricLine)?.seconds * 1000;
        dispatch("skip", newProgress);
    }
</script>

<article id="lines-list" bind:this={linesList}>
    {#if !playbackState?.item}
        <span class="line">Start playing something on Spotify to see the lyrics</span>
    {:else if lyrics == null}
        <span class="line">No live lyrics available</span>
        <a
            class="line"
            href={"https://genius.com/" + (playbackState?.item?.artists?.map((a) => a.name).join(" ") + " " + playbackState?.item?.name).replaceAll(/\s/gm, "-") + "-lyrics"}
            target="_blank"
            rel="noreferrer noopener">View on Genius instead</a
        >
    {:else if lyrics == ""}
        <span class="line active">Loading...</span>
    {:else if lyrics == 403}
        <span class="line">Can't access lyrics database</span>
        <a class="line" href="http://cors-anywhere.herokuapp.com/" rel="noreferrer noopener" target="_blank">Enable access</a>
        <button
            class="line"
            on:click={() => {
                updateLyrics(playbackState);
            }}>Try again</button
        >
    {:else}
        {#each lyrics as line, index}
            <span class="line" id="line-{index.toString()}" on:click={skipToLine}>{line.lyrics}</span>
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

    a,
    a.line,
    button.line {
        font-size: inherit;
        font: inherit;
        background: none;
        text-decoration: none;
        color: #b0db43;
        border: 0.1em solid #b0db43;
        transition: color 0.1s, background-color 0.1s;
        cursor: pointer;
    }

    a:hover,
    a.line:hover,
    button.line:hover {
        background-color: #b0db43;
        color: black;
        mix-blend-mode: screen;
    }

    .line {
        display: block;
        color: white;
        transition: background-color 0.25s;
        transition: color 0.25s;
        /* transition: all 0.25s; */
        padding: 0.25em;
        border-radius: 0.5em;
        cursor: default;
    }

    .line.active {
        background-color: white;
        color: black;
        mix-blend-mode: screen;
    }
</style>
