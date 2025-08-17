'use client'
import React, { useState, useRef, ChangeEvent, KeyboardEvent } from 'react';
import './otp-view.scss';
// Type definitions
interface OTPInputProps {
  length?: number;
  disabled?: boolean;
  onComplete?: (otp: string) => void;
  onChange?: (otp: string) => void;
  className?: string;
  value?: string;
  onReset?: () => void;
}

type OTPDigit = string;
type OTPArray = OTPDigit[];

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  disabled = false,
  onComplete,
  onChange,
  className = '',
  value = '',
  onReset
}) => {
  const [otp, setOtp] = useState<OTPArray>(() => {
    const initialOtp = value.split('').slice(0, length);
    while (initialOtp.length < length) {
      initialOtp.push('');
    }
    return initialOtp;
  });
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Note: We don't update the array when length changes dynamically
  // to avoid state management issues. The parent component should
  // handle ensuring the correct length is passed from the start.

  // Reset OTP when onReset is called
  React.useEffect(() => {
    if (onReset) {
      const resetOtp = Array(length).fill('');
      setOtp(resetOtp);
      inputRefs.current[0]?.focus();
    }
  }, [onReset, length]);

  // Handle input change
  const handleInputChange = (index: number, inputValue: string): void => {
    if (disabled) return;

    if (inputValue.length > 1) return;

    // Only allow numeric input
    if (inputValue && !/^\d$/.test(inputValue)) return;

    const newOtp: OTPArray = [...otp];
    newOtp[index] = inputValue;
    setOtp(newOtp);

    const otpString = newOtp.join('');
    
    // Call onChange callback
    onChange?.(otpString);

    // Call onComplete if all digits are filled
    if (otpString.length === length && !otpString.includes('')) {
      onComplete?.(otpString);
    }

    // Auto-focus next input
    if (inputValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key down for backspace
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>): void => {
    if (disabled) return;

    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className={`otp-input ${className}`}>
      <div className="otp-input__container">
        {otp.map((digit: OTPDigit, index: number) => (
          <input
            key={index}
            ref={(el) => {
              if (el) {
                inputRefs.current[index] = el;
              }
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={digit}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              handleInputChange(index, e.target.value)
            }
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
              handleKeyDown(index, e)
            }
            className={`otp-input__field ${disabled ? 'otp-input__field--disabled' : ''}`}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
    </div>
  );
};

export default OTPInput;