import type { PayloadHandler, PayloadRequest } from 'payload'
import { BaseResponse } from '../types/index.js'
import { OTPService } from '../services/index.js'
import { AfterSetOtpHook, OtpPluginConfig } from '../index.js'
import { createTranslationHelper } from '../utilities/translation.js'

// Type augmentation for Payload
declare module 'payload' {
  interface BasePayload {
    otpPluginHooks?: {
      afterSetOtp?: AfterSetOtpHook;
    };
    otpPluginConfig?: OtpPluginConfig;
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
const handleError = (error: any, operation: string, headers?: Headers): Response => {
  console.error(`${operation} Error:`, error);
  const { t } = createTranslationHelper(headers || new Headers());
  const response = createResponse(null, t("api.internal_server_error"), false);
  return Response.json(response, { status: 500 });
}

// Helper function to initialize OTP service
const initOTPService = (req: PayloadRequest): OTPService => {
  const afterSetOtpHook = req.payload.otpPluginHooks?.afterSetOtp;
  return new OTPService(req, 'users', afterSetOtpHook);
}

export const sendOtpEndpointHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const { t } = createTranslationHelper(req.headers);
    const body = req.json ? await req.json() : {};
    const { mobile, email } = body;

    if (!mobile && !email) {
      const response = createResponse(null, t("api.mobile_or_email_required"), false);
      return Response.json(response, { status: 400 });
    }

    const otpService = initOTPService(req);
    const result = await otpService.sendOTP({ email, mobile }, req.headers);

    const response = createResponse(null, result.message, result.success);
    return Response.json(response, { status: result.success ? 200 : 400 });

  } catch (error) {
    return handleError(error, 'Send OTP', req.headers);
  }
}

export const loginWithMobileEndpointHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const { t } = createTranslationHelper(req.headers);
    const body = req.json ? await req.json() : {};
    const { mobile, otp, email } = body;

    if ((!mobile && !email) || !otp) {
      const response = createResponse(null, t("api.mobile_email_and_otp_required"), false);
      return Response.json(response, { status: 400 });
    }

    const otpService = initOTPService(req);
    const result = await otpService.loginWithOTP({ mobile, email, otp }, req.headers);

    const responseData = result.success ? result.data : null;
    const response = createResponse(responseData, result.message, result.success);
    return Response.json(response, { status: result.success ? 200 : 400 });

  } catch (error) {
    return handleError(error, 'Login with OTP', req.headers);
  }
}

export const getOtpConfigEndpointHandler: PayloadHandler = async (req: PayloadRequest): Promise<Response> => {
  try {
    const { t } = createTranslationHelper(req.headers);
    const config = req.payload.otpPluginConfig;
    const otpLength = config?.otpLength || 6;
    const expiredTime = config?.expiredTime || 300000; // Default 5 minutes

    const response = createResponse({ otpLength, expiredTime }, t("api.otp_config_retrieved"), true);
    return Response.json(response, { status: 200 });

  } catch (error) {
    return handleError(error, 'Get OTP Config', req.headers);
  }
}
