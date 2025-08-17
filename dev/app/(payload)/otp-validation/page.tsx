'use client'

import React from 'react'
import OtpView from '../../../../src/components/otp/otp-view.js'

export default function OTPValidationPage() {
  return (
    <div className="otp-validation-content">
      <OtpView
        initialTimer={300} // 5 minutes
        className="otp-validation-form"
      />
    </div>
  )
}