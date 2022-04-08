export function currentPlaybackPosition() {
    const corrFactor = (playbackState?.timestamp ?? Date.now()) - Date.now();
    return playbackState?.progress_ms ?? 0 + corrFactor;
}

export function remainingPlaybackTime() {
    return currentPlaybackPosition() - playbackState?.item?.duration_ms ?? 0;
}