'use client'
import React, { useState, useEffect } from 'react';
import './otp-view.scss';
import { Button, useTranslation } from '@payloadcms/ui';

import OTPInput from './otp-input.js';
import TimerCountdown from './timer-count-down.js';
import useOtpHook from '../../hook/useOtpHook.js';
import { OtpTranslationsKeys, OtpTranslationsObject } from 'src/translation/index.js';
import { getOtpConfig } from '../../actions/index.js';

// Type definitions
interface OTPViewProps {
  initialTimer?: number;
  className?: string;
  otpLength?: number;
}

function OtpView({
  initialTimer = 120,
  className = '',
  otpLength: propOtpLength
}: OTPViewProps) {

  const {
    resendNewOtp,
    submit,
    currentOtp,
    isTimedOut,
    resetKey,
    setCurrentOtp,
    setIsTimedOut
  } = useOtpHook();

  const { t } = useTranslation<OtpTranslationsObject, OtpTranslationsKeys>();
  const [otpLength, setOtpLength] = useState(propOtpLength || 6);
  const [isConfigLoaded, setIsConfigLoaded] = useState(!!propOtpLength);

  // Fetch OTP configuration only if not provided as prop
  useEffect(() => {
    if (!propOtpLength) {
      const fetchOtpConfig = async () => {
        try {
          const configLength = await getOtpConfig();
          if (configLength) {
            setOtpLength(configLength);
          }
        } catch (error) {
          console.error('Failed to fetch OTP config:', error);
          // Keep default length of 6 if fetch fails
        } finally {
          setIsConfigLoaded(true);
        }
      };

      fetchOtpConfig();
    }
  }, [propOtpLength]);

  // Handle OTP input change
  const handleOtpChange = (otp: string): void => {
    setCurrentOtp(otp);
  };

  // Handle OTP completion
  const handleOtpComplete = (otp: string): void => {
    setCurrentOtp(otp);
  };

  // Handle timer expiration
  const handleTimerExpired = (): void => {
    setIsTimedOut(true);
  };

  // Handle resend code
  const handleResendCode = async (): Promise<boolean> => {
    return resendNewOtp();
  };

  // Handle submit
  const handleSubmit = async (): Promise<void> => {
    if (isTimedOut || currentOtp.length < otpLength) return;
    await submit()
  };

  // Don't render until config is loaded to prevent layout shifts
  if (!isConfigLoaded) {
    return (
      <div className={`otp ${className}`}>
        <div className="otp__container">
          <div className="otp__loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`otp ${className}`}>
      <div className="otp__container">
        <OTPInput
          key={`otp-${otpLength}`} // Force re-mount when length changes
          length={otpLength}
          disabled={isTimedOut}
          onChange={handleOtpChange}
          onComplete={handleOtpComplete}
          className="otp__input-group"
          onReset={resetKey > 0 ? () => { } : undefined}
        />

        <div className="otp__timer-section">
          <TimerCountdown
            key={resetKey}
            initialTimer={initialTimer}
            onExpired={handleTimerExpired}
            onResend={handleResendCode}
            className="otp__timer"
            expiredMessage={t("otp:expired_message")}//"The verification code has expired. Please request a new one."
            activeMessage={t("otp:otp_info") as any}//"Your OTP has been emailed and will expire at"
            showResendButton={true}
          />

          <Button
            size='large'
            onClick={handleSubmit}
            disabled={isTimedOut || currentOtp.length < otpLength}
            type="button"
            aria-label="Submit OTP code"
          >
            {
              t("otp:submit")
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OtpView;