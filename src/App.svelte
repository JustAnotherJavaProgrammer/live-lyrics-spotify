<script lang="ts">
    import logo from "./assets/llfs.svg";
    import getParameters from "./lib/parameters";
    const parameters = getParameters();
</script>

{#if parameters}
    <span>{parameters}</span>
{:else}
    <main class="flex-container">
        <article>
            <img src={logo} class="logo" alt="Live Lyrics for Spotify logo" />
            <h1>Welcome to Live Lyrics for Spotify</h1>
            <a href="">Sign in with Spotify</a>
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
    }
</style>
