// Next Imports
import type { Metadata } from 'next'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'
import { authOptions } from '@/libs/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import ForgotPassword from '@/views/forgot-password'
import { defaultRedirectRoute } from '@/services/app.config'

export const metadata: Metadata = {
  title: 'Forgot-Password',
  description: 'Forgot-Password your account'
}

const LoginPage = async () => {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect(defaultRedirectRoute)
  }
  // Vars
  const mode = getServerMode()

  return <ForgotPassword mode={mode} />
}

export default LoginPage
