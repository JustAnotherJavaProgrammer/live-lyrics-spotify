<script lang="ts">
    import { clientId } from "../../config.json";
    import { fade } from "svelte/transition";
    import logo from "../assets/llfs.svg";
    import checkmarkIcon from "../assets/checkmark.svg";
    import Cookies from "js-cookie";
    import { onMount } from "svelte";
    // Create Spotify auth link
    const authArgs = new URLSearchParams();
    authArgs.append("client_id", clientId);
    authArgs.append("response_type", "token");
    authArgs.append("show_dialog", "false");
    authArgs.append("redirect_uri", window.location.href);
    authArgs.append("scope", "user-modify-playback-state user-read-playback-state user-library-modify user-read-currently-playing user-library-read");
    const auth_url = "https://accounts.spotify.com/authorize?" + authArgs.toString();

    onMount(() => {
        if (Cookies.get("auto-auth") == "true") window.location.href = auth_url;
    });

    function toggleAutoAuth(
        event: Event & {
            currentTarget: EventTarget & HTMLInputElement;
        }
    ) {
        Cookies.set("auto-auth", JSON.stringify(event.currentTarget.checked), { expires: 365 });
    }
</script>

<main class="flex-container" in:fade={{ duration: 250, delay: 250 }} out:fade={{ duration: 250, delay: 0 }} style={`--checkmark:url("${checkmarkIcon}");`}>
    <article>
        <img src={logo} class="logo" alt="Live Lyrics for Spotify logo" />
        <h1>Welcome to Live Lyrics for Spotify</h1>
        <a href={auth_url}>Sign in with Spotify</a>
        <input type="checkbox" id="auto-auth" name="auto-auth" on:change={toggleAutoAuth} checked={Cookies.get("auto-auth") == "true"} />
        <label for="auto-auth">Automatically sign me in next time</label>
    </article>
</main>

<style>
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
        text-align: center;
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
    #auto-auth {
        display: none;
    }
    label {
        padding-top: 0.5em;
        display: block;
        font-size: 1em;
        color: white;
    }
    #auto-auth+label::before {
        display: inline-block;
        content: "";
        color: transparent;
        box-sizing: border-box;
        width: 1em;
        height: 1em;
        margin-inline: 0.2em;
        border: 0.15em solid #b0db43;
        border-radius: 0.2em;
        transition: background 0.2s;
        vertical-align: middle;
    }
    #auto-auth:checked+label::before {
        background: var(--checkmark) #DB2763 no-repeat center/contain;
    }
</style>
