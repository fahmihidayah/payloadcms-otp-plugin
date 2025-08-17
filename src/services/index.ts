import { jwtSign, PayloadRequest } from "payload";
import { addUserSession } from "../utilities/session.js";
import { AfterSetOtpHook } from "../index.js";

interface OTPCredentials {
    mobile?: string;
    email?: string;
}

interface LoginCredentials extends OTPCredentials {
    otp: string;
}

interface ServiceResponse<T = null> {
    success: boolean;
    message: string;
    data?: T;
}

interface LoginResponse {
    token: string;
    user: any;
}

export class OTPService {
    private payload: any;
    private authCollection : string;
    private request : PayloadRequest;
    private afterSetOtpHook?: AfterSetOtpHook;

    constructor(request : PayloadRequest, collection : string, afterSetOtpHook?: AfterSetOtpHook) {
        this.payload = request.payload;
        this.authCollection = collection;
        this.request = request;
        this.afterSetOtpHook = afterSetOtpHook;
    }

    generateOTP(length: number = 6): string {
        const min = Math.pow(10, length - 1);
        const max = Math.pow(10, length) - 1;
        return `${Math.floor(Math.random() * (max - min + 1)) + min}`;
    }

    private async cleanupExpiredOTPs(credentials: OTPCredentials): Promise<void> {
        const where = credentials.mobile
            ? { mobile: { equals: credentials.mobile } }
            : { email: { equals: credentials.email } };

        await this.payload.delete({
            collection: 'otpCode',
            where: {
                ...where,
                expiresAt: { less_than: new Date() }
            },
            overrideAccess: true
        });
    }

    private async storeOTP(credentials: OTPCredentials, code: string): Promise<any> {
        // Get expiredTime from plugin configuration (in milliseconds)
        const expiredTime = this.payload.otpPluginConfig?.expiredTime || 300000; // Default 5 minutes
        const expiresAt = new Date(Date.now() + expiredTime);

        const otpRecord = await this.payload.create({
            collection: 'otpCode',
            data: {
                ...credentials,
                code,
                expiresAt,
                verified: false
            },
            overrideAccess: true
        });

        // Execute afterSetOtp hook if provided
        if (this.afterSetOtpHook) {
            await this.afterSetOtpHook({
                otp: code,
                credentials,
                otpRecord,
                payload: this.payload,
                req: this.request
            });
        }

        return otpRecord;
    }

    async sendOTP(credentials: OTPCredentials): Promise<ServiceResponse> {
        try {
            if (!credentials.mobile && !credentials.email) {
                return {
                    success: false,
                    message: 'Mobile or email is required'
                };
            }

            await this.cleanupExpiredOTPs(credentials);

            // Get OTP length from plugin configuration
            const otpLength = this.payload.otpPluginConfig?.otpLength || 6;
            const otpCode = this.generateOTP(otpLength);
            await this.storeOTP(credentials, otpCode);

            // TODO: Integrate with SMS/Email service
            console.log(`OTP for ${credentials.mobile || credentials.email}: ${otpCode}`);

            return {
                success: true,
                message: 'OTP sent successfully'
            };
        } catch (error) {
            console.error('Error sending OTP:', error);
            return {
                success: false,
                message: 'Failed to send OTP'
            };
        }
    }

    private async verifyOTP(credentials: LoginCredentials): Promise<{ isValid: boolean; otpRecord?: any }> {
        const where = credentials.mobile
            ? { mobile: { equals: credentials.mobile } }
            : { email: { equals: credentials.email } };

        const otpRecord = await this.payload.find({
            collection: 'otpCode',
            where: {
                ...where,
                code: { equals: credentials.otp },
                verified: { equals: false },
                expiresAt: { greater_than: new Date() }
            },
            overrideAccess: true
        });

        const isValid = otpRecord.docs.length > 0;

        if (isValid) {
            await this.payload.update({
                collection: 'otpCode',
                id: otpRecord.docs[0].id,
                data: { verified: true },
                overrideAccess: true
            });
        }

        return { isValid, otpRecord: otpRecord.docs[0] };
    }

    private async findOrCreateUser(credentials: OTPCredentials): Promise<any> {
        const where = credentials.mobile
            ? { mobile: { equals: credentials.mobile } }
            : { email: { equals: credentials.email } };

        const users = await this.payload.find({
            collection: 'users',
            where,
            overrideAccess: true
        });

        if (users.docs.length > 0) {
            const user = users.docs[0];

            // Update verification status for existing users
            if (credentials.mobile) {
                await this.payload.update({
                    collection: 'users',
                    id: user.id,
                    data: { mobileVerified: true },
                    overrideAccess: true
                });
            }

            return user;
        }

        // Create new user
        const userData = credentials.mobile
            ? {
                mobile: credentials.mobile,
                email: `${credentials.mobile}@mobile.user`,
                mobileVerified: true,
                password: `${credentials.mobile}temp`
            }
            : {
                email: credentials.email,
                mobile: '',
                mobileVerified: true,
                password: `${credentials.email}temp`
            };

        return await this.payload.create({
            collection: 'users',
            data: userData,
            overrideAccess: true
        });
    }

    private async generateAuthToken(user: any): Promise<string> {
            const collectionConfig = this.payload.collections[this.authCollection].config


        const { sid } = await addUserSession({
            collectionConfig,
            payload : this.payload,
            req : this.request,
            user,
        })

        const token = await jwtSign({
            fieldsToSign: {
                id: user.id,
                collection: 'users',
                email: user.email,
                sid: sid
            },
            secret: this.payload.secret,
            tokenExpiration: 3600 * 2 // 2 hours
        });

        return token.token;
    }

    async loginWithOTP(credentials: LoginCredentials): Promise<ServiceResponse<LoginResponse>> {
        try {
            if ((!credentials.mobile && !credentials.email) || !credentials.otp) {
                return {
                    success: false,
                    message: 'Mobile/email and OTP are required'
                };
            }

            const { isValid } = await this.verifyOTP(credentials);


            if (!isValid) {
                return {
                    success: false,
                    message: 'Invalid or expired OTP'
                };
            }

            const user = await this.findOrCreateUser(credentials);
            const token = await this.generateAuthToken(user);

            return {
                success: true,
                message: 'Login successful',
                data: { token, user }
            };
        } catch (error) {
            console.error('Error during OTP login:', error);
            return {
                success: false,
                message: 'Login failed'
            };
        }
    }

    // Backward compatibility
    async loginWithMobile(credentials: LoginCredentials): Promise<{ success: boolean; token?: string; user?: any; message: string }> {
        const result = await this.loginWithOTP(credentials);
        return {
            success: result.success,
            token: result.data?.token,
            user: result.data?.user,
            message: result.message
        };
    }
}