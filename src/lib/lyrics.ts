let runningRequest: Promise<Response> = undefined;

export default async function getLyrics(trackid: string): Promise<LyricLine[] | null | 403> {
    if (localStorage) {
        const cachedLyrics = JSON.parse(localStorage.getItem(trackid)) as LyricLine[];
        if (cachedLyrics != null)
            return cachedLyrics;
    }
    return fetchLyrics(trackid);
}

async function fetchLyrics(trackid: string): Promise<LyricLine[] | null | 403> {
    try {
        if (runningRequest) {
            await runningRequest;
        }
        runningRequest = fetch("https://cors-anywhere.herokuapp.com/https://spotify-lyric-api.herokuapp.com/?" + new URLSearchParams({ trackid: trackid }).toString(), { mode: "cors" });
        const response = await runningRequest;
        runningRequest = undefined;
        if (!response.ok) {
            console.error(response);
            if (response.status === 403) {
                return 403;
            }
            return null;
        }
        const parsedResponse = await response.json();
        if (parsedResponse.error)
            return null;
        if (parsedResponse.syncType !== "LINE_SYNCED" && parsedResponse.syncType !== "UNSYNCED") {
            console.warn("Unhandled syncType: " + parsedResponse.syncType);
            console.debug(parsedResponse);
            return null;
        }
        const lyrics: LyricLine[] = (await parsedResponse.lines as RawLyricLine[]).map((line, i, arr) => {
            const convertedLine: LyricLine = { words: line.words.trim(), startTimeMs: parseInt(line.startTimeMs), endTimeMs: parseInt(line.endTimeMs), syllables: line.syllables };
            if (convertedLine.endTimeMs < convertedLine.startTimeMs)
                convertedLine.endTimeMs =
                    (i < arr.length - 1 ? parseInt(arr[i + 1].startTimeMs) : 0);
            return convertedLine;
        }).sort((a, b) => a.startTimeMs - b.startTimeMs).filter(l => l.words.length > 0); /* Sorting, just in case */
        if (localStorage && parsedResponse.syncType === "LINE_SYNCED")
            localStorage.setItem(trackid, JSON.stringify(lyrics));
        return lyrics;
    } catch (err) {
        console.log(err);
        return null;
    }
}

export async function cacheLyrics(song: string) {
    if (!localStorage) return;
    if (localStorage.getItem(song) === null) {
        const lyrics = await fetchLyrics(song);
        if (Array.isArray(lyrics)) {
            localStorage.setItem(song, JSON.stringify(lyrics));
        }
    }
}

export function isSynced(lyrics: LyricLine[]) {
    if(!Array.isArray(lyrics)) {
        return false;
    }
    return lyrics.some(line => line.startTimeMs !== 0 || line.endTimeMs !== 0);
}

type RawLyricLine = {
    startTimeMs: string,
    endTimeMs: string,
    words: string,
    syllables: []
}

export type LyricLine = {
    startTimeMs: number,
    endTimeMs: number,
    words: string,
    syllables: []
}