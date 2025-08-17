'use client';

import { useEffect, useState } from "react";
// import { resendOtp, resetToken, submitOtp } from "../actions";
import { toast, useTranslation } from "@payloadcms/ui"
import { usePathname, useRouter } from "next/navigation.js";
import { OtpTranslationsKeys, OtpTranslationsObject } from "src/translation/index.js";
import { resendOtp, resetToken, submitOtp } from "src/actions/index.js";

export default function useOtpHook() {

    const [currentOtp, setCurrentOtp] = useState<string>('');
    const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
    const [resetKey, setResetKey] = useState<number>(0);
    const router = useRouter();
    const {t} = useTranslation<OtpTranslationsObject, OtpTranslationsKeys>()

    const pathname = usePathname();

    useEffect(() => {
        const timer = setTimeout(() => {
            const getOtp = async () => {
                const currentOtp = await resetToken();

                if (!currentOtp) {
                    router.push("/admin/login");
                }
            };
            if (pathname === '/otp-validation') {
                getOtp();
            }

        }, 500); // debounce: 500ms delay

        return () => clearTimeout(timer); // cleanup
    }, [pathname]);

    const submit = async () => {

        try {
            const result = await submitOtp(currentOtp);
            if (result) {
                router.push("/admin");
            } else {
                toast.error(t("otp:wrong_otp_code"));
            }
        } catch (error) {
            toast.error(t("otp:failed_submitting_otp"));
        }

    }

    const resendNewOtp = async () => {

        try {
            const result = await resendOtp();
            if (result) {
                toast.success(t("otp:new_otp_sent"));
                setIsTimedOut(false);
                setCurrentOtp('');
                setResetKey(prev => prev + 1); // Trigger reset for both components
                return true;
            } else {
                toast.error(t("otp:session_ended"));
                router.push("/admin/login");
                return false;
            }
        } catch (error) {
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