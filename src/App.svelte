<script lang="ts">
    import logo from "./assets/llfs.svg";
    import getParameters, { AuthParameters } from "./lib/parameters";
    import { clientId } from "../config.json";
    import { fade } from "svelte/transition";
    import { getContext, hasContext, setContext } from "svelte";
    import { writable } from "svelte/store";
    import Player from "./lib/Player.svelte";

    // Create Spotify auth link
    const authArgs = new URLSearchParams();
    authArgs.append("client_id", clientId);
    authArgs.append("response_type", "token");
    authArgs.append("show_dialog", "false");
    authArgs.append("redirect_uri", "http://localhost:3000/");
    authArgs.append("scope", "user-modify-playback-state user-read-playback-state user-library-modify user-read-currently-playing user-library-read");
    const auth_url = "https://accounts.spotify.com/authorize?" + authArgs.toString();
    const parameters = writable(getParameters());
    setContext("auth_data", parameters);
    let params: AuthParameters | void;
    parameters.subscribe((p) => (params = p));
</script>

{#if params}
    <Player />
{:else}
    <main class="flex-container" in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 250, delay: 0 }}>
        <article>
            <img src={logo} class="logo" alt="Live Lyrics for Spotify logo" />
            <h1>Welcome to Live Lyrics for Spotify</h1>
            <a href={auth_url}>Sign in with Spotify</a>
        </article>
    </main>
{/if}

<style>
    :root {
        font-family: Inter, Helvetica, Arial, Roboto, sans-serif;
        background: url("/llfs_blurry.svg") #db2763 no-repeat center/cover;
        color: #ffffff;
    }

    :global(body) {
        margin: 0;
        min-height: 100vh;
    }

    :global(.info, h1, h2, h3, h4, h5, h6) {
        font-family: Inter, Helvetica, Arial, Roboto, sans-serif;
        font-weight: 600;
    }

    .flex-container {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    main.flex-container {
        min-height: 100vh;
    }

    .logo {
        width: 10em;
        height: 10em;
        display: block;
    }

    article {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    h1 {
        font-size: 2.5em;
        margin-block: 0.5em;
    }

    a {
        font-size: 1.5em;
        color: black;
        text-decoration: none;
        border: none;
        border-radius: 0.5em;
        background-color: #b0db43;
        padding: 0.5em;
        font-weight: bold;
    }
</style>
