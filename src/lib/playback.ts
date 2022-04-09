import type { Writable } from "svelte/store";

export function currentPlaybackPosition(playbackState: SpotifyApi.CurrentPlaybackResponse) {
    const corrFactor = Date.now() - (playbackState?.timestamp ?? Date.now());
    // console.log("corrFactor", corrFactor);
    // console.log("playbackState_timestamp", playbackState?.timestamp);
    return (playbackState?.progress_ms ?? 0) + (playbackState?.is_playing ? corrFactor : 0);
}

export function remainingPlaybackTime(playbackState: SpotifyApi.CurrentPlaybackResponse) {
    return currentPlaybackPosition(playbackState) - playbackState?.item?.duration_ms ?? 0;
}

export function manuallySetProgress(playbackState: SpotifyApi.CurrentPlaybackResponse, pbs: Writable<SpotifyApi.CurrentPlaybackResponse>,progress: number) {
    playbackState.progress_ms =/*-= currentPlaybackPosition(playbackState) -*/ progress;
    pbs.set(playbackState);
}