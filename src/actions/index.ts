'use server';

import { cookies, headers } from "next/headers.js";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  collection: string;
  email?: string;
  mobile?: string;
  exp: number;
  iat: number;
}

interface APIResponse<T = any> {
  data: T | null;
  message: string;
  code: number;
  error: boolean;
}

async function getBaseUrl(): Promise<string> {
  // Try to get the base URL from environment variable first
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }
  
  // Fallback to constructing from headers
  try {
    const headersList = await headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    
    if (host) {
      return `${protocol}://${host}`;
    }
  } catch (error) {
    console.error('Error getting headers:', error);
  }
  
  // Final fallback for development
  return 'http://localhost:3000';
}

export async function resetToken(): Promise<string | undefined> {
  try {
    const appCookies = await cookies();
    const token = appCookies.get("payload-token")?.value;

    if (token) {
      appCookies.set("otp-token", token);
      appCookies.delete("payload-token");
      await sendOtp();
      return token;
    }
  } catch (error) {
    console.error('Error resetting token:', error);
  }
  
  return undefined;
}

export async function sendOtp(): Promise<{ success: boolean; message: string }> {
  try {
    const appCookies = await cookies();
    const token = appCookies.get("otp-token")?.value;

    if (!token) {
      return {
        success: false,
        message: "No authentication token found"
      };
    }

    // Decode JWT token to get user credentials
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwtDecode<DecodedToken>(token);
    } catch (decodeError) {
      return {
        success: false,
        message: "Invalid authentication token"
      };
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      return {
        success: false,
        message: "Authentication token has expired"
      };
    }

    // Prepare credentials for OTP sending
    const credentials: { email?: string; mobile?: string } = {};
    if (decodedToken.email) {
      credentials.email = decodedToken.email;
    }
    if (decodedToken.mobile) {
      credentials.mobile = decodedToken.mobile;
    }

    if (!credentials.email && !credentials.mobile) {
      return {
        success: false,
        message: "No email or mobile found in token"
      };
    }

    const body = JSON.stringify(credentials)
    // Send OTP request
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/otp/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body
    });

    const result: APIResponse = await response.json();

    return {
      success: result.code === 200 && !result.error,
      message: result.message
    };

  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: "Failed to send OTP. Please try again."
    };
  }
}

export async function submitOtp(code: string): Promise<{ success: boolean; message: string; token?: string }> {
  try {
    if (!code || code.trim().length === 0) {
      return {
        success: false,
        message: "OTP code is required"
      };
    }

    const appCookies = await cookies();
    const token = appCookies.get("otp-token")?.value;

    if (!token) {
      return {
        success: false,
        message: "No authentication token found"
      };
    }

    // Decode JWT token to get user credentials
    let decodedToken: DecodedToken;
    try {
      decodedToken = jwtDecode<DecodedToken>(token);
    } catch (decodeError) {
      return {
        success: false,
        message: "Invalid authentication token"
      };
    }

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      return {
        success: false,
        message: "Authentication token has expired"
      };
    }

    // Prepare credentials for OTP verification
    const credentials: { email?: string; mobile?: string; otp: string } = {
      otp: code.trim()
    };

    if (decodedToken.email) {
      credentials.email = decodedToken.email;
    }
    if (decodedToken.mobile) {
      credentials.mobile = decodedToken.mobile;
    }

    if (!credentials.email && !credentials.mobile) {
      return {
        success: false,
        message: "No email or mobile found in token"
      };
    }

    // Submit OTP for verification
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/otp/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials)
    });

    const result: APIResponse<{ token: string; user: any }> = await response.json();

    if (result.code === 200 && !result.error && result.data?.token) {
      // Set new authentication token
      appCookies.set("payload-token", result.data.token);
      appCookies.delete("otp-token");

      return {
        success: true,
        message: result.message,
        token: result.data.token
      };
    }

    return {
      success: false,
      message: result.message || "OTP verification failed"
    };

  } catch (error) {
    console.error('Error submitting OTP:', error);
    return {
      success: false,
      message: "Failed to verify OTP. Please try again."
    };
  }
}

export async function resendOtp(): Promise<{ success: boolean; message: string }> {
  // Resend OTP is the same as sending OTP
  return await sendOtp();
}