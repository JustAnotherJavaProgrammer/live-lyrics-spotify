export function currentPlaybackPosition(playbackState: SpotifyApi.CurrentPlaybackResponse) {
    const corrFactor = (playbackState?.timestamp ?? Date.now()) - Date.now();
    return playbackState?.progress_ms ?? 0 + corrFactor;
}

export function remainingPlaybackTime(playbackState: SpotifyApi.CurrentPlaybackResponse) {
    return currentPlaybackPosition(playbackState) - playbackState?.item?.duration_ms ?? 0;
}