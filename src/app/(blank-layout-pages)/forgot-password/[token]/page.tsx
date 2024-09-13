// Next Imports
import type { Metadata } from 'next'
import { useRouter } from 'next/router'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { authOptions } from '@/libs/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ResetPassword from '@/views/ResetPassword'

export const metadata: Metadata = {
  title: 'Forgot Password',
  description: 'Reset your password'
}

const ForgotPasswordPage = async ({ params }: { params: { token: string } }) => {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/home')
  }

  // Vars
  const mode = getServerMode()

  // Extract the token from the URL
  const { token } = params

  // Use the token for password reset logic or validation
  return <ResetPassword mode={mode} token={token} />
}

export default ForgotPasswordPage
