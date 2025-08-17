import React from 'react';
import { getOtpConfig } from '../../actions/index.js';
import OtpView from './otp-view.js';

interface OtpPageProps {
  initialTimer?: number;
  className?: string;
}

const OtpPage: React.FC<OtpPageProps> = async ({ 
  initialTimer, 
  className = '' 
}) => {
  // Fetch OTP configuration on the server
  const config = await getOtpConfig();
  const otpLength = config?.otpLength || 6;
  const expiredTime = config ? Math.floor(config.expiredTime / 1000) : (initialTimer || 120); // Convert to seconds

  return (
    <OtpView 
      otpLength={otpLength}
      expiredTime={expiredTime}
      initialTimer={initialTimer} // Keep for fallback
      className={className}
    />
  );
};

export default OtpPage;