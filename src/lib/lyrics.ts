let runningRequest = undefined;

export default async function getLyrics(song: string): Promise<LyricLine[] | null> {
    try {
        if (runningRequest) {
            await runningRequest;
        }
        runningRequest = fetch("https://cors-anywhere.herokuapp.com/https://api.textyl.co/api/lyrics?" + new URLSearchParams({ q: song }).toString(), { mode: "cors", headers: [["Origin", "https://api.textyl.co"]] });
        const response = await runningRequest;
        runningRequest = undefined;
        if (!response.ok) {
            console.error(response);
            return null;
        }
        return await response.json() as LyricLine[];
    } catch (err) {
        console.log(err);
        return null;
    }
}

export type LyricLine = {
    seconds: number,
    lyrics: string
}