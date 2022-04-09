import Cookies from "js-cookie";

export default function getParameters(): AuthParameters | void {
    {
        const params = new URLSearchParams(window.location.hash.substring(1));
        // console.log(params);
        if (params.has("access_token") && params.has("expires_in")) {
            Cookies.set("token", params.get("access_token"), { sameSite: "Strict" });
            Cookies.set("expires_at", (Date.now() + parseInt(params.get("expires_in")) * 1000).toString(), { sameSite: "Strict" });
            // Quickly remove the token from the URL to prevent users from accidentally sharing this information
            window.history.replaceState({}, document.title, "/");
        }
        if (Cookies.get("token") && Cookies.get("expires_at") && Cookies.get("expires_at") > Date.now().toString()) {
            return {
                token: Cookies.get("token"),
                expiresAt: parseInt(Cookies.get("expires_at"))
            };
        }
    }
}

export type AuthParameters = {
    expiresAt: number,
    token: string,
}