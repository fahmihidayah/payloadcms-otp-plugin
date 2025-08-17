import type { PayloadHandler, PayloadRequest } from 'payload'
import { BaseResponse } from '../types/index.js'
import { OTPService } from '../services/index.js'
import { AfterSetOtpHook } from '../index.js'

// Type augmentation for Payload
declare module 'payload' {
  interface BasePayload {
    otpPluginHooks?: {
      afterSetOtp?: AfterSetOtpHook;
    };
  }
}

// Helper function to create standardized responses
const createResponse = <T>(data: T | null, message: string, success: boolean): BaseResponse<T | null> => ({
  data: success ? data : null,
  message,
  code: success ? 200 : 400,
  error: !success
})

// Helper function to handle errors
const handleError = (error: any, operation: string): Response => {
  console.error(`${operation} Error:`, error);
  const response = createResponse(null, "Internal server error", false);
  return Response.json(response, { status: 500 });
}

// Helper function to initialize OTP service
const initOTPService = (req: PayloadRequest): OTPService => {
  const afterSetOtpHook = req.payload.otpPluginHooks?.afterSetOtp;
  return new OTPService(req, 'users', afterSetOtpHook);
}

export const sendOtpEndpointHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const body = req.json ? await req.json() : {};
    const { mobile, email } = body;

    if (!mobile && !email) {
      const response = createResponse(null, "Mobile or email is required", false);
      return Response.json(response, { status: 400 });
    }

    const otpService = initOTPService(req);
    const result = await otpService.sendOTP({ email, mobile });

    const response = createResponse(null, result.message, result.success);
    return Response.json(response, { status: result.success ? 200 : 400 });

  } catch (error) {
    return handleError(error, 'Send OTP');
  }
}

export const loginWithMobileEndpointHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const body = req.json ? await req.json() : {};
    const { mobile, otp, email } = body;

    if ((!mobile && !email) || !otp) {
      const response = createResponse(null, "Mobile/email and OTP are required", false);
      return Response.json(response, { status: 400 });
    }

    const otpService = initOTPService(req);
    const result = await otpService.loginWithOTP({ mobile, email, otp });

    const responseData = result.success ? result.data : null;
    const response = createResponse(responseData, result.message, result.success);
    return Response.json(response, { status: result.success ? 200 : 400 });

  } catch (error) {
    return handleError(error, 'Login with OTP');
  }
}
