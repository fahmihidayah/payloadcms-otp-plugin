import type { CollectionSlug, Config } from 'payload'

// Type augmentation for Payload
declare module 'payload' {
  interface BasePayload {
    otpPluginHooks?: {
      afterSetOtp?: AfterSetOtpHook;
    };
    otpPluginConfig?: OtpPluginConfig;
  }
}

// import { loginWithMobileEndpointHandler, resendOtpEndpointHandler, submitOtpEndpointHandler } from './endpoints/customEndpointHandler.js'
import { OtpCode } from './collections/OtpCode.js'
import { enhanceUsersCollection } from './collections/enhanceUserCollection.js'
import { 
  sendOtpEndpointHandler, 
  loginWithMobileEndpointHandler,
  getOtpConfigEndpointHandler,
} from './endpoints/customEndpointHandler.js'

export type AfterSetOtpHook = (args: {
  otp: string;
  credentials: { mobile?: string; email?: string };
  otpRecord: any;
  payload: any;
  req: any;
}) => Promise<void> | void;

export type OtpPluginConfig = {
  /**
   * List of collections to add a custom field
   */
  collections?: Partial<Record<CollectionSlug, true>>
  disabled?: boolean,
  expiredTime: number,
  /**
   * Length of the OTP code (default: 6)
   */
  otpLength?: number,
  /**
   * Hook executed after OTP is created and stored
   */
  afterSetOtp?: AfterSetOtpHook,
}

export const otpPlugin =
  (pluginOptions: OtpPluginConfig) =>
  (config: Config): Config => {
    if (!config.collections) {
      config.collections = []
    }

    // Create OTP Code collection with plugin options
    // const otpCodeCollection = createOtpCodeCollection({
    //   ...pluginOptions.otpCodeCollection,
    //   expiredTime: pluginOptions.expiredTime,
    // })
    
    config.collections.push(OtpCode)

    // Enhance collections specified in plugin options
    if (pluginOptions.collections) {
      config.collections = config.collections.map((collection) => {
        if (pluginOptions.collections && pluginOptions.collections[collection.slug]) {
          // If it's the users collection, enhance it with OTP functionality
          if (collection.slug === 'users') {
            return enhanceUsersCollection(collection)
          }
          // For other collections, you could add other enhancements here
        }
        return collection
      })
    }
  
    /**
     * If the plugin is disabled, we still want to keep added collections/fields so the database schema is consistent which is important for migrations.
     * If your plugin heavily modifies the database schema, you may want to remove this property.
     */
    if (pluginOptions.disabled) {
      return config
    }

    if (!config.endpoints) {
      config.endpoints = []
    }

    if (!config.admin) {
      config.admin = {}
    }

    if (!config.admin.components) {
      config.admin.components = {}
    }

    if (!config.admin.components.beforeDashboard) {
      config.admin.components.beforeDashboard = []
    }


    // New service-integrated endpoints
    config.endpoints.push({
      handler: sendOtpEndpointHandler, 
      method: 'post',
      path: "/otp/send"
    })

    config.endpoints.push({
      handler: loginWithMobileEndpointHandler,
      method: 'post',
      path: "/otp/login"
    })

    config.endpoints.push({
      handler: getOtpConfigEndpointHandler,
      method: 'get',
      path: "/otp/config"
    })

    // Store the hook in payload for access in endpoints
    const incomingOnInit = config.onInit

    config.onInit = async (payload) => {
      // Ensure we are executing any existing onInit functions before running our own.
      if (incomingOnInit) {
        await incomingOnInit(payload)
      }

      // Store the plugin configuration in payload for component access
      payload.otpPluginConfig = pluginOptions;
      
      // Store the afterSetOtp hook in payload for endpoint access
      if (pluginOptions.afterSetOtp) {
        payload.otpPluginHooks = {
          afterSetOtp: pluginOptions.afterSetOtp
        };
      }
    }

    return config
  }
