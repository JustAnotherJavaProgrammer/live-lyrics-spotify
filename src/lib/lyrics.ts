export default async function getLyrics(song: string): Promise<LyricLine[] | null> {
    try {
        const response = await fetch("https://api.textyl.co/lyrics?" + new URLSearchParams({ q: song }).toString());
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