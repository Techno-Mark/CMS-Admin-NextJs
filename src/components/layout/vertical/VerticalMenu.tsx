'use client'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, SubMenu } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const { settings } = useSettings()
  const { isBreakpointReached } = useVerticalNav()

  // Vars
  const { transitionDuration } = verticalNavOptions

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    // eslint-disable-next-line lines-around-comment
    /* Custom scrollbar instead of browser scroll, remove if you want browser scroll only */
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      {/* Incase you also want to scroll NavHeader to scroll with Vertical Menu, remove NavHeader from above and paste it below this comment */}
      {/* Vertical Menu */}
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <MenuItem href='/home' icon={<i className='tabler-dashboard' />}>
          Dashboard
        </MenuItem>
        <MenuItem href='/content-management/blogs' icon={<i className='tabler-brand-blogger' />}>
          Blogs
        </MenuItem>
        <MenuItem href='/content-management/contact-us' icon={<i className='tabler-address-book' />}>
          Contact Us
        </MenuItem>
        <MenuItem href='/content-management/pages' icon={<i className='tabler-brand-pagekit' />}>
          Pages
        </MenuItem>
        <MenuItem href='/content-management/menus' icon={<i className='tabler-menu-2' />}>
          Menus
        </MenuItem>
        <MenuItem href='/content-management/popups' icon={<i className='tabler-box-model-2' />}>
          Popup
        </MenuItem>
        <MenuItem href='/content-management/events' icon={<i className='tabler-calendar-event' />}>
          Events
        </MenuItem>
        <MenuItem href='/content-management/recrutments' icon={<i className='tabler-briefcase' />}>
          Recrutments
        </MenuItem>
        <SubMenu
          label={"Users"}
          icon={<i className='tabler-users-group' />}
        >
          <MenuItem href={`/users/management`} icon={<i className='tabler-users'></i>}>Users</MenuItem>
          <MenuItem href={`/users/roles`} icon={<i className='tabler-user-cog'></i>}>Roles</MenuItem>
          <MenuItem href={`/users/permissions`} icon={<i className='tabler-accessible'></i>}>Permissions</MenuItem>
        </SubMenu>
        <SubMenu
          label={"Settings"}
          icon={<i className='tabler-settings' />}
        >
          <MenuItem href={`/settings/organizations`} icon={<i className='tabler-affiliate'></i>}>Organizations</MenuItem>
          <MenuItem href={`/settings/content-blocks`} icon={<i className='tabler-box-margin'></i>}>Content Blocks</MenuItem>
          <MenuItem href={`/settings/templates`} icon={<i className='tabler-template'></i>}>Templates</MenuItem>
          <MenuItem href={`/settings/modules`} icon={<i className='tabler-stack-middle'></i>}>Modules</MenuItem>
          <MenuItem href={`/settings/general`} icon={<i className='tabler-file-settings'></i>}>General</MenuItem>
        </SubMenu>
      </Menu>
      {/* <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        <GenerateVerticalMenu menuData={menuData(dictionary, params)} />
      </Menu> */}
    </ScrollWrapper>
  )
}

export default VerticalMenu
