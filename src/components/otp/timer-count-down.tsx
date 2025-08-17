'use client'
import React, { useState, useEffect } from 'react';
import './otp-view.scss';
import { useTranslation } from '@payloadcms/ui';
import { OtpTranslationsKeys, OtpTranslationsObject } from 'src/translation/index.js';
// Type definitions
interface TimerCountdownProps {
  initialTimer?: number;
  onExpired?: () => void;
  onReset?: () => void;
  className?: string;
  expiredMessage?: string;
  activeMessage?: string;
  showResendButton?: boolean;
  onResend?: () => Promise<boolean>;
}

const TimerCountdown: React.FC<TimerCountdownProps> = ({
  initialTimer = 10,
  onExpired,
  onReset,
  className = '',
  expiredMessage = 'The verification code has expired. Please request a new one.',
  activeMessage = 'Your OTP has been emailed and will expire at',
  showResendButton = true,
  onResend
}) => {
  const [timer, setTimer] = useState<number>(initialTimer);
  const [isExpired, setIsExpired] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const { t } = useTranslation<OtpTranslationsObject, OtpTranslationsKeys>();

  // Timer effect
  useEffect(() => {
    if (timer > 0 && !isExpired) {
      const interval: NodeJS.Timeout = setInterval(() => {
        setTimer((prev: number) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setIsExpired(true);
      onExpired?.();
    }
  }, [timer, isExpired, onExpired]);

  // Reset timer when onReset is called
  useEffect(() => {
    if (onReset) {
      setTimer(initialTimer);
      setIsExpired(false);
    }
  }, [onReset, initialTimer]);

  // Format timer display
  const formatTime = (seconds: number): string => {
    const minutes: number = Math.floor(seconds / 60);
    const remainingSeconds: number = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Handle resend
  const handleResend = async (): Promise<void> => {
    if (!onResend) return;
    
    setIsResending(true);
    try {
      const success = await onResend();
      if (success) {
        setTimer(initialTimer);
        setIsExpired(false);
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={`timer-countdown ${className}`}>
      {!isExpired ? (
        <p className="timer-countdown__active" role="timer" aria-live="polite">
          {activeMessage} <strong>{formatTime(timer)}</strong>.
        </p>
      ) : (
        <div className="timer-countdown__expired">
          <p className="timer-countdown__expired-message" role="alert">
            {expiredMessage}
            {showResendButton && onResend && (
              <button
                className="timer-countdown__resend-btn timer-countdown__resend-btn--underline"
                onClick={handleResend}
                disabled={isResending}
                type="button"
                aria-label="Resend verification code"
              >
                {isResending ? t("otp:sending") : t("otp:resend")}
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default TimerCountdown;