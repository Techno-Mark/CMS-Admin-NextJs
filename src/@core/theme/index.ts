// Next Imports
import { Public_Sans as PublicSansFont } from 'next/font/google'

// MUI Imports
import type { Theme } from '@mui/material/styles'

// Type Imports
import type { Settings } from '@core/contexts/settingsContext'
import type { SystemMode, Skin } from '@core/types'

// Theme Options Imports
import overrides from './overrides'
import colorSchemes from './colorSchemes'
import spacing from './spacing'
import shadows from './shadows'
import customShadows from './customShadows'
import typography from './typography'

const publicSans = PublicSansFont({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '800', '900'] })

const theme = (settings: Settings, mode: SystemMode, direction: Theme['direction']): Theme => {
  return {
    direction,
    components: overrides(settings.skin as Skin),
    colorSchemes: colorSchemes(settings.skin as Skin),
    ...spacing,
    shape: {
      borderRadius: 6,
      customBorderRadius: {
        xs: 2,
        sm: 4,
        md: 6,
        lg: 8,
        xl: 10
      }
    },
    shadows: shadows(mode),
    typography: typography(publicSans.style.fontFamily),
    customShadows: customShadows(mode),
    mainColorChannels: {
      light: '47 43 61',
      dark: '225 222 245',
      lightShadow: '47 43 61',
      darkShadow: '19 17 32'
    }
  } as unknown as Theme
}

export default theme
