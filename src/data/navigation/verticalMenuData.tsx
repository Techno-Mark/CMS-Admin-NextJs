// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard',
    href: '/home',
    icon: 'tabler-smart-home'
  },
  {
    label: 'Settings',
    href: '/about',
    icon: 'tabler-info-circle'
  }
]

export default verticalMenuData
