<script lang="ts" context="module">
    declare module "virtual:pwa-register/svelte" {
        // @ts-ignore ignore when svelte is not installed
        import { Writable } from "svelte/store";

        export type RegisterSWOptions = {
            immediate?: boolean;
            onNeedRefresh?: () => void;
            onOfflineReady?: () => void;
            onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
            onRegisterError?: (error: any) => void;
        };

        export function useRegisterSW(options?: RegisterSWOptions): {
            needRefresh: Writable<boolean>;
            offlineReady: Writable<boolean>;
            updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
        };
    }
</script>

<script lang="ts">
    import "./global.css";
    if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
        window.location.protocol = "https:";
    }
    // @ts-ignore
    import { registerSW } from "virtual:pwa-register";

    const updateSW = registerSW({
        onOfflineReady() {
            /*console.log("SW is ready");*/
        },
        onRegistered(r) {
            r &&
                setInterval(() => {
                    r.update();
                }, 60 * 60 * 1000);
        },
    });

    import logo from "./assets/llfs.svg";
    import getParameters, { AuthParameters } from "./lib/parameters";
    import { clientId } from "../config.json";
    import { fade } from "svelte/transition";
    import { getContext, hasContext, setContext } from "svelte";
    import { writable } from "svelte/store";
    import Player from "./lib/Player.svelte";
    import SeekBar from "./lib/SeekBar.svelte";
    import AuthScreen from "./lib/AuthScreen.svelte";

    const parameters = writable(getParameters());
    setContext("auth_data", parameters);
    let params: AuthParameters | void;
    parameters.subscribe((p) => (params = p));
</script>

{#if params}
    <Player />
{:else}
    <AuthScreen />
{/if}
