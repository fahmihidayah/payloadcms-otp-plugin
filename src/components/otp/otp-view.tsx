'use client'
import React, { useState } from 'react';
import './otp-view.scss';
import { Button, useTranslation } from '@payloadcms/ui';
// import { resendOtp, submitOtp } from '../actions';
import { toast } from "@payloadcms/ui";
import OTPInput from './otp-input.js';
import TimerCountdown from './timer-count-down.js';
import useOtpHook from '../../hook/useOtpHook.js';
import { OtpTranslationsKeys, OtpTranslationsObject } from 'src/translation/index.js';

// Type definitions
interface OTPViewProps {
  initialTimer?: number;
  className?: string;
}

function OtpView ({
  initialTimer = 120,
  className = ''
} : OTPViewProps) {

  const {
    resendNewOtp,
    submit,
    currentOtp,
    isTimedOut,
    resetKey,
    setCurrentOtp,
    setIsTimedOut,
    setResetKey
  } = useOtpHook();

  const {i18n, t} = useTranslation<OtpTranslationsObject, OtpTranslationsKeys>();

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
    if (isTimedOut || currentOtp.length < 6) return;
    await submit()
  };

  return (
    <div className={`otp ${className}`}>
      <div className="otp__container">
        <OTPInput
          length={6}
          disabled={isTimedOut}
          onChange={handleOtpChange}
          onComplete={handleOtpComplete}
          className="otp__input-group"
          onReset={resetKey > 0 ? () => {} : undefined}
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
            disabled={isTimedOut || currentOtp.length < 6}
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