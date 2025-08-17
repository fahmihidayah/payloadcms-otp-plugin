export { otpPlugin } from '../index.js'
export type { OtpPluginConfig } from '../index.js'
export { OtpCode, OTP_CODE_SLUG } from '../collections/OtpCode.js'
export { OTPService } from '../services/index.js'
export { 
  sendOtpEndpointHandler, 
  loginWithMobileEndpointHandler 
} from '../endpoints/customEndpointHandler.js'