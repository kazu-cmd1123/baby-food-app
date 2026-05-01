import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(
  process.env.RESET_JWT_SECRET ?? 'fallback-secret-change-in-production'
)

// リセットトークン生成（有効期限1時間）
export async function createResetToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret)
}

// リセットトークン検証
export async function verifyResetToken(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return { userId: payload.userId as string, email: payload.email as string }
  } catch {
    return null
  }
}
