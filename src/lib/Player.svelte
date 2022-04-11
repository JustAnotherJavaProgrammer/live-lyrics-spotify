<script lang="ts">
    import { getContext, onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { get, writable, Writable } from "svelte/store";
    import type { AuthParameters } from "./parameters";
    import SpotifyWebApi from "spotify-web-api-js";
    import logo from "../assets/llfs.svg";
    import fullscreenIcon from "../assets/fullscreen.svg";
    import closeFullscreenIcon from "../assets/close_fullscreen.svg";
    import { currentPlaybackPosition, manuallySetProgress, remainingPlaybackTime } from "./playback";
    import Lyrics from "./Lyrics.svelte";
    import { startWakelock, stopWakelock } from "./wakelock";
    import SeekBar from "./SeekBar.svelte";
    import { clamp } from "./util";
    const auth_data = getContext("auth_data") as Writable<AuthParameters>;
    const auth_params = get(auth_data);
    const spotify = new SpotifyWebApi();
    spotify.setAccessToken(auth_params.token);
    let coverImg: string;
    let playbackState: SpotifyApi.CurrentPlaybackResponse;
    const pbs = writable(playbackState);
    let interval: number;
    let interval_progress: number;

    onMount(() => {
        startWakelock();
        updatePlaybackState();
    });
    onDestroy(() => {
        if (interval != undefined) window.clearInterval(interval);
        if (interval_progress != undefined) window.clearInterval(interval_progress);
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
            updateProgress();
            const remainingTime = remainingPlaybackTime(playbackState);
            interval = window.setTimeout(updatePlaybackState, Math.min(remainingTime > 0 && playbackState?.is_playing ? remainingTime : 5000, 5000));
        }
    }

    // Seeking from lyrics
    function jumpToPosition(event: CustomEvent<number>) {
        seek(event.detail, true);
    }

    function seek(position_ms: number, restartIfStopped = false) {
        manuallySetProgress(playbackState, pbs, position_ms);
        playbackState.is_playing = false;
        operationUnderway = true;
        // const id = playbackState.item.id;
        spotify.seek(position_ms).then(async () => {
            if (restartIfStopped && !playbackState.is_playing) {
                await spotify.play({ position_ms });
            }
            updatePlaybackState(true);
        });
    }

    // Fullscreen
    let main: HTMLElement;
    let isFullscreen = document.fullscreenElement != null;
    async function toggleFullscreen() {
        if (!document.fullscreenElement) {
            await main?.requestFullscreen();
        } else {
            await document?.exitFullscreen();
        }
        isFullscreen = document.fullscreenElement != null;
    }

    // Seek bar
    let progress = 0;
    let progress_time = 0;
    let isSeeking = false;
    function updateProgress() {
        if (!isSeeking) {
            progress_time = clamp(0, currentPlaybackPosition(playbackState), playbackState?.item?.duration_ms ?? 0);
            if (playbackState?.item?.duration_ms == undefined) progress = 0;
            else progress = progress_time / playbackState?.item?.duration_ms;
        }
        const nextUpdate = 1000 - (progress_time % 1000);
        if (interval_progress != undefined) window.clearInterval(interval_progress);
        interval_progress = window.setTimeout(updateProgress, nextUpdate);
    }
    function startSeeking(event: CustomEvent<number>) {
        isSeeking = true;
        changeSeekPos(event);
    }
    function changeSeekPos(event: CustomEvent<number>) {
        progress = event.detail;
        progress_time = progress * playbackState?.item?.duration_ms ?? 0;
    }
    function endSeeking(event: CustomEvent<number>) {
        isSeeking = false;
        changeSeekPos(event);
        seek(Math.floor(progress_time));
    }
    function formatMillis(millis: number) {
        let num = Math.floor(millis / 1000);
        let result = (num % 60).toString().padStart(2, "0"); // seconds
        num = Math.floor(num / 60);
        // if (num > 0) {
        result = (num % 60).toString().padStart(2, "0") + ":" + result; // minutes:seconds
        num = Math.floor(num / 60);
        if (num > 0) {
            result = num + ":" + result; // hours:minutes:seconds
        }
        // }
        return result;
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
        <footer>
            <div class="seek">
                <span id="progress_time">{formatMillis(progress_time ?? 0)}</span>
                <SeekBar width="min(50vmax, 75vmin)" height="max(1vh, 5px)" {progress} on:dragStart={startSeeking} on:dragChange={changeSeekPos} on:dragEnd={endSeeking} />
                <span id="song_length">{formatMillis(playbackState?.item?.duration_ms ?? 0)}</span>
            </div>
        </footer>
    </section>
    {#if coverImg || isFullscreen}
        <div class="background-cover">
            <aside class="background-cover" style={`--img:url("${coverImg ?? logo}");`} />
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
        z-index: 10;
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
        -webkit-tap-highlight-color: transparent;
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

    footer {
        flex: 0 0 fit-content;
        padding: 0.5em;
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        box-shadow: 0 0 0.2em 0 rgba(0, 0, 0, 1);
        box-sizing: border-box;
        z-index: 10;
    }

    .seek {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }
</style>
