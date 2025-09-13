import { canUserGenerate, incrementGenerationCount } from "@/lib/firebase/firestore"

export interface PlanLimits {
  dailyGenerations: number
  maxCharacters: number
  maxFileUploads: number
  supportsLinks: boolean
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    dailyGenerations: 1,
    maxCharacters: 5000,
    maxFileUploads: 1,
    supportsLinks: false,
  },
  paid: {
    dailyGenerations: -1, // unlimited
    maxCharacters: -1, // unlimited
    maxFileUploads: -1, // unlimited
    supportsLinks: true,
  },
}

export const getPlanLimits = (plan: string): PlanLimits => {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free
}

export const checkGenerationLimit = async (userId: string): Promise<{ allowed: boolean; reason?: string }> => {
  const result = await canUserGenerate(userId)
  return {
    allowed: result.canGenerate,
    reason: result.reason,
  }
}

export const recordGeneration = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  const result = await incrementGenerationCount(userId)
  return {
    success: !result.error,
    error: result.error,
  }
}

export const checkInputLimits = (
  plan: string,
  input: string,
  fileCount: number,
): { valid: boolean; reason?: string } => {
  const limits = getPlanLimits(plan)

  if (limits.maxCharacters > 0 && input.length > limits.maxCharacters) {
    return {
      valid: false,
      reason: `Input exceeds ${limits.maxCharacters} character limit. Upgrade to Paid Plan for unlimited characters.`,
    }
  }

  if (limits.maxFileUploads > 0 && fileCount > limits.maxFileUploads) {
    return {
      valid: false,
      reason: `File upload limit exceeded (${limits.maxFileUploads} max). Upgrade to Paid Plan for unlimited uploads.`,
    }
  }

  return { valid: true }
}
