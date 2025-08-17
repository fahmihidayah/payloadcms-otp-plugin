'use server';

import { cookies } from "next/headers.js";

export async function resetToken(): Promise<string | undefined> {
    const appCookies = await cookies();

    const token = appCookies.get("payload-token")?.value;

    if (token) {
        appCookies.set("otp-token", token);
        appCookies.delete("payload-token")
        return token;
    }


}

export async function submitOtp(code: string) : Promise<boolean | undefined> {
    const appCookies = await cookies();

    const token = appCookies.get("otp-token")

    const response = await fetch("/api/submit-otp", {
        method: "POST",
        body: JSON.stringify({
            code: code,
        }),
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    // check error case

    return true;
}

export async function resendOtp() : Promise<boolean | undefined> {
    const appCookies = await cookies();
    const token = appCookies.get("otp-token")?.value;
    const response = await fetch("/api/resend-otp", {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + token
        }
    });

    // check error case 
    return true;
}