import React from 'react';
import { getOtpConfig } from '../../actions/index.js';
import OtpView from './otp-view.js';

interface OtpPageProps {
  initialTimer?: number;
  className?: string;
}

const OtpPage: React.FC<OtpPageProps> = async ({ 
  initialTimer = 120, 
  className = '' 
}) => {
  // Fetch OTP configuration on the server
  const otpLength = await getOtpConfig() || 6;

  return (
    <OtpView 
      otpLength={otpLength}
      initialTimer={initialTimer}
      className={className}
    />
  );
};

export default OtpPage;