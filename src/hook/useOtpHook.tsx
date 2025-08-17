'use client';

import { useEffect, useState } from "react";
// import { resendOtp, resetToken, submitOtp } from "../actions";
import { toast, useTranslation } from "@payloadcms/ui"
import { usePathname, useRouter } from "next/navigation.js";
import { OtpTranslationsKeys, OtpTranslationsObject } from "src/translation/index.js";
import { resendOtp, resetToken, submitOtp } from "../actions/index.js";

export default function useOtpHook() {

    const [currentOtp, setCurrentOtp] = useState<string>('');
    const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0);
    const router = useRouter();
    const {t} = useTranslation<OtpTranslationsObject, OtpTranslationsKeys>()

    const pathname = usePathname();

    useEffect(() => {
        const timer = setTimeout(() => {
            const initializeOtp = async () => {
                const token = await resetToken();
                if(!token) {
                    router.push('/admin')

                }
            };
            
            if (pathname === '/otp-validation' || pathname === '/admin/otp-validation') {
                initializeOtp();
            }

        }, 500); // debounce: 500ms delay

        return () => clearTimeout(timer); // cleanup
    }, [pathname]);

    const submit = async () => {
        try {
            const result = await submitOtp(currentOtp);
            if (result.success) {
                toast.success(result.message);
                // Get redirect params from URL
                const urlParams = new URLSearchParams(window.location.search);
                const adminRedirect = urlParams.get('admin-redirect');
                const redirectPath = adminRedirect || '/admin';
                router.push(redirectPath);
            } else {
                toast.error(result.message || t("otp:wrong_otp_code"));
            }
        } catch (error) {
            console.error('Error submitting OTP:', error);
            toast.error(t("otp:failed_submitting_otp"));
        }
    }

    const resendNewOtp = async () => {
        try {
            const result = await resendOtp();
            if (result.success) {
                toast.success(result.message || t("otp:new_otp_sent"));
                setIsTimedOut(false);
                setCurrentOtp('');
                setResetKey(prev => prev + 1); // Trigger reset for both components
                return true;
            } else {
                toast.error(result.message || t("otp:session_ended"));
                if (result.message && (result.message.includes('token') || result.message.includes('expired'))) {
                    router.push("/admin/login");
                }
                return false;
            }
        } catch (error) {
            console.error('Error resending OTP:', error);
            toast.error(t('otp:failed_to_send_otp'));
            return false;
        }
    }

    return {
        submit,
        resendNewOtp,
        currentOtp, 
        setCurrentOtp,
        isTimedOut, 
        setIsTimedOut,
        resetKey,
        setResetKey
    };
}