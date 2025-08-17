import { CollectionConfig } from "payload";

export const OTP_CODE_SLUG = "otpCode"

export const OtpCode: CollectionConfig = {
    slug: OTP_CODE_SLUG,
    access: {
        create: () => true, // Allow creation from API
        read: () => true,  // Allow read access
        update: () => true, // Allow update for verification
        delete: () => true, // Allow delete for cleanup
    },
    fields: [
        {
            name: 'email',
            label: "Email",
            type: "email",
            defaultValue : '',
            required: false,
        },
        {
            name: 'mobile',
            type: 'text',
            defaultValue: '',
            required: false,
            index: true,
        },
        {
            name: 'code',
            type: 'text',
            required: true,
        },
        {
            name: 'expiresAt',
            type: 'date',
            required: true,
        },
        {
            name: 'verified',
            type: 'checkbox',
            defaultValue: false,
        }
    ],
    timestamps: true,
}