import { randomUUID } from "crypto";
import { Payload, PayloadRequest, SanitizedCollectionConfig, TypedUser } from "payload";

export const removeExpiredSessions = (
  sessions: { createdAt: Date | string; expiresAt: Date | string; id: string }[],
) => {
  const now = new Date()

  return sessions.filter(({ expiresAt }) => {
    const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt)
    return expiry > now
  })
}

/**
 * TODO: Remove when Payload exports this function
 */
export const addUserSession = async ({
  collectionConfig,
  payload,
  req,
  user,
}: {
  collectionConfig: SanitizedCollectionConfig
  payload: Payload
  req: PayloadRequest
  user: TypedUser
}): Promise<{ sid?: string }> => {
  let sid: string | undefined
  if (collectionConfig.auth.useSessions) {
    // Add session to user
    sid = randomUUID()
    const now = new Date()
    const tokenExpInMs = collectionConfig.auth.tokenExpiration * 1000
    const expiresAt = new Date(now.getTime() + tokenExpInMs)

    const session = { id: sid, createdAt: now, expiresAt }

    if (!user.sessions?.length) {
      user.sessions = [session]
    } else {
      user.sessions = removeExpiredSessions(user.sessions)
      user.sessions.push(session)
    }

    await payload.db.updateOne({
      id: user.id,
      collection: collectionConfig.slug,
      data: user,
      req,
      returning: false,
    })

    user.collection = collectionConfig.slug
    user._strategy = 'local-jwt'
  }

  return {
    sid,
  }
}
