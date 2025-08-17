'use client'
import React, { useState, useEffect } from 'react';
import './otp-view.scss';
import { Button, useTranslation } from '@payloadcms/ui';

import OTPInput from './otp-input.js';
import TimerCountdown from './timer-count-down.js';
import useOtpHook from '../../hook/useOtpHook.js';
import { OtpTranslationsKeys, OtpTranslationsObject } from 'src/translation/index.js';
import { getOtpConfig, OtpConfig } from '../../actions/index.js';

// Type definitions
interface OTPViewProps {
  initialTimer?: number;
  className?: string;
  otpLength?: number;
  expiredTime?: number;
}

function OtpView({
  initialTimer,
  className = '',
  otpLength: propOtpLength,
  expiredTime: propExpiredTime
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
  const [expiredTime, setExpiredTime] = useState(propExpiredTime || initialTimer || 120);
  const [isConfigLoaded, setIsConfigLoaded] = useState(!!(propOtpLength && propExpiredTime));

  // Fetch OTP configuration only if not provided as props
  useEffect(() => {
    if (!propOtpLength || !propExpiredTime) {
      const fetchOtpConfig = async () => {
        try {
          const config = await getOtpConfig();
          if (config) {
            if (!propOtpLength) setOtpLength(config.otpLength);
            if (!propExpiredTime) setExpiredTime(Math.floor(config.expiredTime / 1000)); // Convert to seconds for timer
          }
        } catch (error) {
          console.error('Failed to fetch OTP config:', error);
          // Keep defaults if fetch fails
          if (!propOtpLength) setOtpLength(6);
          if (!propExpiredTime) setExpiredTime(initialTimer || 120);
        } finally {
          setIsConfigLoaded(true);
        }
      };

      fetchOtpConfig();
    }
  }, [propOtpLength, propExpiredTime, initialTimer]);

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
            initialTimer={expiredTime}
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