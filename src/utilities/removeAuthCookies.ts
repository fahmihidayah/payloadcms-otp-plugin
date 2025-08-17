
import { cookies } from "next/headers.js";
import { Auth, generatePayloadCookie } from "payload"

type SetPayloadAuthCookieArgs = {
    cookieName?: string,
    authConfig: Auth
    cookiePrefix: string
}


export default async function removeAuthCookies({
    authConfig,
    cookiePrefix,
    cookieName
}: SetPayloadAuthCookieArgs) : Promise<string | undefined> {

    const nextCookies = await cookies();

    const existingToken = await nextCookies.get(cookieName ?? "payload-token");

    nextCookies.delete(cookieName ?? "payload-token")

    return existingToken?.value;

}