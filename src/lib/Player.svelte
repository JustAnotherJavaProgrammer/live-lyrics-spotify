<script lang="ts">
    import { getContext, onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { get, writable, Writable } from "svelte/store";
    import type { AuthParameters } from "./parameters";
    import SpotifyWebApi from "spotify-web-api-js";
    import logo from "../assets/llfs.svg";
    import fullscreenIcon from "../assets/fullscreen.svg";
    import closeFullscreenIcon from "../assets/close_fullscreen.svg";
    import { manuallySetProgress, remainingPlaybackTime } from "./playback";
    import Lyrics from "./Lyrics.svelte";
    import { startWakelock, stopWakelock } from "./wakelock";
    const auth_data = getContext("auth_data") as Writable<AuthParameters>;
    const auth_params = get(auth_data);
    const spotify = new SpotifyWebApi();
    spotify.setAccessToken(auth_params.token);
    let coverImg: string;
    let playbackState: SpotifyApi.CurrentPlaybackResponse;
    const pbs = writable(playbackState);
    let interval: number;

    onMount(() => {
        startWakelock();
        updatePlaybackState();
    });
    onDestroy(() => {
        if (interval != undefined) window.clearInterval(interval);
        stopWakelock();
    });

    // let lastId: string = null;
    // let corrTime: number = 0;
    let operationUnderway = false;
    async function updatePlaybackState(resetOp = false) {
        if (!operationUnderway || resetOp) {
            try {
                const before = Date.now();
                playbackState = await spotify.getMyCurrentPlaybackState();
                if (resetOp) operationUnderway = false;
                if (operationUnderway) return;
                if (playbackState != undefined && (playbackState as unknown as string) != "") {
                    // if(playbackState.item.id != lastId) {
                    //     corrTime=0;
                    // }
                    // playbackState.timestamp += playbackState.progress_ms + Math.floor((Date.now() - before) / 2);
                    playbackState.timestamp = Date.now() - Math.floor((Date.now() - before) / 2);
                }
                coverImg = playbackState?.item?.album?.images[0]?.url;
                // console.log("fetchedPlaybackState.timestamp", playbackState.progress_ms);
                if (!operationUnderway) pbs.set(playbackState);
            } catch (err) {
                console.error(err);
                auth_data.set(undefined);
            }
            const remainingTime = remainingPlaybackTime(playbackState);
            interval = window.setTimeout(updatePlaybackState, Math.min(remainingTime > 0 && playbackState?.is_playing ? remainingTime : 5000, 5000));
        }
    }

    function jumpToPosition(event: CustomEvent<number>) {
        manuallySetProgress(playbackState, pbs, event.detail);
        operationUnderway = true;
        spotify.seek(event.detail).then(() => {
            updatePlaybackState(true);
        });
    }

    let main: HTMLElement;
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            main?.requestFullscreen();
        } else {
            document?.exitFullscreen();
        }
    }
</script>

<main bind:this={main} in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 250, delay: 0 }}>
    <section class="main-section">
        <header>
            <img class="album-art" alt="Album art" src={coverImg ?? logo} />
            <div class="name-info">
                <h1 class="song-name">{playbackState?.item?.name ?? "No playback"}</h1>
                <h2 class="artist-name">{playbackState?.item?.artists?.map((a) => a.name).join(" & ") ?? "Live Lyrics for Spotify"}</h2>
            </div>
            <button on:click={toggleFullscreen} class="fullscreen-toggle" style={`--open:url("${fullscreenIcon}");--close:url("${closeFullscreenIcon}");`} />
        </header>
        <Lyrics {pbs} on:skip={jumpToPosition} />
    </section>
    {#if coverImg}
        <div class="background-cover">
            <aside class="background-cover" style={`--img:url("${coverImg}");`} />
        </div>
    {/if}
</main>

<style>
    main {
        height: 100vh;
    }

    section.main-section {
        display: flex;
        flex-direction: column;
        justify-content: stretch;
        align-items: stretch;
        height: 100%;
    }

    header {
        flex: 0 0 fit-content;
        padding: 0.5em;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        box-shadow: 0 0 0.2em 0 rgba(0, 0, 0, 1);
        box-sizing: border-box;
    }

    .album-art {
        background-color: #db2763;
        max-height: 15vh;
        min-height: 5em;
        /* aspect-ratio: 1/1; */
        box-shadow: 0.1em 0.1em 0.2em 0 rgba(0, 0, 0, 0.5);
        flex: 0 1 15vh;
        margin-right: 0.5em;
    }

    .name-info {
        padding-inline: 0.5em;
    }

    .song-name {
        font-size: max(5vmin, 2em);
        margin: 0 0 0.1em 0;
        overflow: hidden;
    }

    .artist-name {
        font-size: max(2.5vmin, 1em);
        color: rgba(255, 255, 255, 0.75);
        margin: 0 0 0 0;
        overflow: hidden;
        padding-left: 0.1em;
    }

    .fullscreen-toggle {
        background: var(--open) no-repeat center/contain;
        justify-self: flex-end;
        margin-left: auto;
        margin-right: 4vmin;
        flex: 0 1 5vh;
        border: none;
        outline: none;
        box-shadow: none;
        min-height: max(5vmin, 2em);
        min-width: max(5vmin, 2em);
        height: max(5vmin, 2em);
        width: max(5vmin, 2em);
        max-height: max(5vmin, 2em);
        max-width: max(5vmin, 2em);
        cursor: pointer;
    }

    .fullscreen-toggle:hover {
        height: max(6vmin, 2.2em);
        width: max(6vmin, 2.2em);
        max-height: max(6vmin, 2.2em);
        max-width: max(6vmin, 2.2em);
        flex-basis: max(6vmin, 2.2em);
        margin-right: 3.5vmin;
    }

    *:fullscreen .fullscreen-toggle {
        background-image: var(--close);
    }

    div.background-cover {
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        max-width: 100%;
        max-height: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
        background-color: #c492b1;
    }
    aside.background-cover {
        position: absolute;
        top: -10%;
        left: -10%;
        /* right: 0;
        bottom: 0; */
        min-width: 120%;
        min-height: 120%;
        overflow: hidden;
        margin: 0;
        padding: 0;
        background: var(--img) #c492b1 no-repeat center/cover;
        filter: brightness(0.8) blur(10vmax);
    }
</style>
