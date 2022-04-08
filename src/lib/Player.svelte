<script lang="ts">
    import { getContext, onDestroy, onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { get, writable, Writable } from "svelte/store";
    import type { AuthParameters } from "./parameters";
    import SpotifyWebApi from "spotify-web-api-js";
    import logo from "../assets/llfs.svg";
    import { remainingPlaybackTime } from "./playback";
import Lyrics from "./Lyrics.svelte";
    const auth_data = getContext("auth_data") as Writable<AuthParameters>;
    const auth_params = get(auth_data);
    const spotify = new SpotifyWebApi();
    spotify.setAccessToken(auth_params.token);
    let coverImg: string;
    let playbackState: SpotifyApi.CurrentPlaybackResponse;
    const pbs = writable(playbackState);
    let interval: number;

    onMount(updatePlaybackState);
    onDestroy(() => {
        if (interval != undefined) window.clearInterval(interval);
    });

    async function updatePlaybackState() {
        try {
            playbackState = await spotify.getMyCurrentPlaybackState();
            coverImg = playbackState?.item?.album?.images[0]?.url;
            pbs.set(playbackState);
        } catch (err) {
            console.error(err);
            auth_data.set(undefined);
        }
        const remainingTime = remainingPlaybackTime();
        interval = window.setTimeout(updatePlaybackState, Math.min(remainingTime > 0 ? remainingTime : 5000, 5000));
    }
</script>

<main in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 250, delay: 0 }}>
    <section class="main-section">
        <header>
            <img class="album-art" alt="Album art" src={coverImg ?? logo} />
            <div class="name-info">
                <h1 class="song-name">{playbackState?.item?.name ?? "No playback"}</h1>
                <h2 class="artist-name">{playbackState?.item?.artists?.map((a) => a.name).join(" & ") ?? "Live Lyrics for Spotify"}</h2>
            </div>
        </header>
        <Lyrics pbs={pbs}/>
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
    }

    header {
        flex: 0 0 fit-content;
        padding: 0.5em;
        display: flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        box-shadow: 0.2em 0 0.2em 0 rgba(0, 0, 0, 1);
        box-sizing: border-box;
    }

    .album-art {
        background-color: #db2763;
        max-height: 15vh;
        /* aspect-ratio: 1/1; */
        box-shadow: 0.1em 0.1em 0.2em 0 rgba(0, 0, 0, 0.5);
        flex: 0 1 15vh;
        margin-right: 0.5em;
    }

    .name-info {
        padding-inline: 0.5em;
    }

    .song-name {
        font-size: min(7.5vmin, 10em);
        margin: 0 0 0.1em 0;
        overflow: hidden;
    }

    .artist-name {
        font-size: min(2.5vmin, 3.3em);
        color: rgba(255, 255, 255, 0.75);
        margin: 0 0 0 0;
        overflow: hidden;
        padding-left: 0.1em;
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
        filter: blur(10vmax);
    }
</style>
