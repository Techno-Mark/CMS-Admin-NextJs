// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import { NextAuthProvider } from '@/contexts/nextAuthProvider'
import CircularProgress from '@mui/material/CircularProgress'
import Backdrop from '@mui/material/Backdrop';

// Util Imports
import { getDemoName, getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'
import themeConfig from '@/configs/themeConfig'
import AppReactToastify from '@/libs/styles/AppReactToastify'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = async (props: Props) => {

  
  
  // Props
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
          <Backdrop
            sx={{ color: '#fff', zIndex: 9999 }}
            open={false}
          >
            <CircularProgress className="screen-center" />
          </Backdrop>
        </ThemeProvider>
      </SettingsProvider>
    </VerticalNavProvider>
    </NextAuthProvider>
  )
}

export default Providers