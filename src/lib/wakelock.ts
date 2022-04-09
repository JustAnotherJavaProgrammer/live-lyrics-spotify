export const wakelockSupported = "wakeLock" in navigator;

let currentWakelock: WakeLockSentinel = null;
export function startWakelock() {
    requestWakelock();
    document.addEventListener("visibilitychange", requestWakelock);
}

export function stopWakelock() {
    document.removeEventListener("visibilitychange", requestWakelock);
    if (currentWakelock != undefined) {
        currentWakelock.release();
        currentWakelock = null;
    }
}

async function requestWakelock() {
    if (wakelockSupported && (currentWakelock == undefined || currentWakelock.released) && document.visibilityState === "visible") {
        currentWakelock = await navigator.wakeLock.request("screen");
    }
}