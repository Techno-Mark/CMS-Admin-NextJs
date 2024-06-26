
import type { ChildrenType, Direction } from '@core/types'
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import { getDemoName, getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'
import themeConfig from '@/configs/themeConfig'
import AppReactToastify from '@/libs/styles/AppReactToastify'
import LoadingBackdrop from './LoadingBackdrop'

type Props = ChildrenType & {
  direction: Direction,
  // isLoading :boolean
}

const Providers = async (props: Props) => {

  // Props
  // isLoading
  const { children, direction } = props

  // Vars
  const mode = getMode()
  const settingsCookie = getSettingsFromCookie()
  const demoName = getDemoName()
  const systemMode = getSystemMode()

  return (
    <NextAuthProvider basePath={process.env.NEXTAUTH_BASEPATH}>
    <VerticalNavProvider>
      <SettingsProvider settingsCookie={settingsCookie} mode={mode} demoName={demoName}>
        <ThemeProvider direction={direction} systemMode={systemMode}>
          {children}
          <AppReactToastify position={themeConfig.toastPosition} hideProgressBar />
          {/* <LoadingBackdrop isLoading={isLoading} /> */}
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
    </NextAuthProvider>
  )
}

export default Providers