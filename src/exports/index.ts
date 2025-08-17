export { otpPlugin } from '../index.js'
export type { OtpPluginConfig } from '../index.js'
export { OtpCode, OTP_CODE_SLUG } from '../collections/OtpCode.js'
export { OTPService } from '../services/index.js'
export { 
  sendOtpEndpointHandler, 
  loginWithMobileEndpointHandler 
} from '../endpoints/customEndpointHandler.js'

// Components
export { default as OtpPage } from '../components/otp/otp-page.js'
export { default as OtpView } from '../components/otp/otp-view.js'
export { default as OTPInput } from '../components/otp/otp-input.js'

// Actions and Types
export { getOtpConfig, sendOtp, submitOtp, resendOtp, resetToken } from '../actions/index.js'
export type { OtpConfig } from '../actions/index.js'