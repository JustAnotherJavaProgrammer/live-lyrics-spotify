let runningRequest: Promise<Response> = undefined;

export default async function getLyrics(song: string): Promise<LyricLine[] | null | 403> {
    if (localStorage) {
        const cachedLyrics = JSON.parse(localStorage.getItem(song)) as LyricLine[];
        if (cacheLyrics != null)
            return cachedLyrics;
    }
    return fetchLyrics(song);
}

async function fetchLyrics(song: string): Promise<LyricLine[] | null | 403> {
    try {
        if (runningRequest) {
            await runningRequest;
        }
        runningRequest = fetch("https://cors-anywhere.herokuapp.com/https://api.textyl.co/api/lyrics?" + new URLSearchParams({ q: song }).toString(), { mode: "cors" /*, headers: [["Origin", "https://api.textyl.co"]]*/ });
        const response = await runningRequest;
        runningRequest = undefined;
        if (!response.ok) {
            console.error(response);
            if (response.status === 403) {
                return 403;
            }
            return null;
        }
        const lyrics = await response.json() as LyricLine[];
        if (localStorage)
            localStorage.setItem(song, JSON.stringify(lyrics));
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

export type LyricLine = {
    seconds: number,
    lyrics: string
}