import { AuthStrategyFunctionArgs, AuthStrategyResult, CollectionConfig } from "payload";
import { OTP_CODE_SLUG } from "./OtpCode.js";

export const enhanceUsersCollection = (existingConfig: CollectionConfig): CollectionConfig => ({
  ...existingConfig,
  fields: [
    ...existingConfig.fields,
    {
      name: 'mobile',
      type: 'text',
      unique: true,
      index: true,
    },
    {
      name: 'mobileVerified',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
});