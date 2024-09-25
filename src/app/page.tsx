// Next Imports
import { defaultRedirectRoute } from '@/services/app.config'
import { redirect } from 'next/navigation'

export default function Page() {
  redirect(defaultRedirectRoute)
}
