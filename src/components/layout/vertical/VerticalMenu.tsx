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
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { getDecryptedPermissionData } from '@/utils/storageService'

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
  const { data: session } = useSession()

  // State to hold decrypted permission data
  const [permissionData, setPermissionData] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true) // Add loading state

  // Fetch decrypted data once on component mount
  const fetchDecryptedData = async () => {
    try {
      const data = await getDecryptedPermissionData()
      if (data) {
        setPermissionData(data)
      }
    } catch (error) {
      console.error('Error fetching decrypted data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDecryptedData() // Retrieve and decrypt the permission data on initial load
  }, [])

  // Detect changes in permission data
  useEffect(() => {
    if (!loading) {
      // Handle any logic needed when permissionData changes
      console.log('Permission data updated:', permissionData)
    }
  }, [permissionData, loading]) // Dependency array includes permissionData and loading


  // Function to check if a permission exists
  const hasPermission = (menuKey: string) => permissionData && permissionData[menuKey]

  if (loading) {
    // Display a loading indicator or an empty state while loading
    return <div>Loading menu...</div>

    
  }
  
  console.log(session?.user?.id);
  return (
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
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme, settings)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {(session?.user?.id === 1 || hasPermission('Dashboard')) && (
          <MenuItem href='/home' icon={<i className='tabler-dashboard' />}>
            Dashboard
          </MenuItem>
        )}
        {(session?.user?.id === 1 || hasPermission('Blog')) && (
          <MenuItem href='/content-management/blogs' icon={<i className='tabler-brand-blogger' />}>
            Blogs
          </MenuItem>
        )}
        {(session?.user?.id === 1 || hasPermission('Page')) && (
          <MenuItem href='/content-management/pages' icon={<i className='tabler-brand-pagekit' />}>
            Pages
          </MenuItem>
        )}
        {(session?.user?.id === 1 || hasPermission('Event')) && (
          <MenuItem href='/content-management/events' icon={<i className='tabler-calendar-event' />}>
            Events
          </MenuItem>
        )}
         {(session?.user?.id === 1 || hasPermission('Media')) && (
        <MenuItem href={`/content-management/media`} icon={<i className='tabler-file-upload'></i>}>
          Media
        </MenuItem> )}
         {(session?.user?.id === 1  || hasPermission('Static Component')) && (
        <MenuItem href={`/content-management/static-component`} icon={<i className='tabler-file-upload'></i>}>
          Static Component
        </MenuItem> )}

        {(session?.user?.id === 1 ) && (
          <>
            <SubMenu label={"Users"} icon={<i className='tabler-users-group' />}>
              <MenuItem href={`/users/management`} icon={<i className='tabler-users'></i>}>Users</MenuItem>
              <MenuItem href={`/users/roles`} icon={<i className='tabler-user-cog'></i>}>Roles</MenuItem>
              <MenuItem href={`/users/permissions`} icon={<i className='tabler-accessible'></i>}>Permissions</MenuItem>
            </SubMenu>
            <SubMenu label={"Settings"} icon={<i className='tabler-settings' />}>
              <MenuItem href={`/settings/organizations`} icon={<i className='tabler-affiliate'></i>}>Organization</MenuItem>
              <MenuItem href={`/settings/content-blocks`} icon={<i className='tabler-box-margin'></i>}>Content Blocks</MenuItem>
              <MenuItem href={`/settings/templates`} icon={<i className='tabler-template'></i>}>Templates</MenuItem>
              <MenuItem href={`/settings/modules`} icon={<i className='tabler-stack-middle'></i>}>Modules</MenuItem>
            </SubMenu>
          </>
        )}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
