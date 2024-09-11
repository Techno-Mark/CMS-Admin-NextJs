'use client'

// React Imports
import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import { useSession, signOut } from 'next-auth/react'
import { authnetication } from '@/services/endpoint/auth'
import { post } from '@/services/apiService'
import { encryptData, getKey } from '@/utils/cryptoUtils'
import { getDecryptedPermissionData, storePermissionData } from '@/utils/storageService'


// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)',
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLDivElement>(null)

  // Hooks
  const router = useRouter()

  const { settings } = useSettings()
  const { data: session } = useSession()

  // Extract user details from session
  const userName = session?.user?.name || 'Admin'
  const userEmail = session?.user?.email || 'Please wait'
  const avatarText = userName.split(' ').map(n => n[0]).join('')

  const handleDropdownOpen = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    localStorage.removeItem("encryptedPermissionData");
    await signOut({ callbackUrl: '/login' })
  }

  const getPermissionModule = async () => {
    const data = await getDecryptedPermissionData();
    if (data) {
      storePermissionData(data);
    }
    if (!data) {
      try {
        const result = await post(authnetication.user_permission_data, {});
        await storePermissionData(result.data);
      } catch (error: any) {
        console.error(error);

      }
    }
  };
  useEffect(() => {


    getPermissionModule();
  }, []);

  return (
    <>
      <Badge
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <div className='flex items-center pli-6' tabIndex={-1}>
          <div className='flex items-start flex-col'>
            <Typography className='font-medium' color='text.primary'>
              {userName}
            </Typography>
            <Typography variant='caption'>{userEmail}</Typography>
          </div>
        </div>
        <Avatar
          ref={anchorRef}
          alt={userName}
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        >
          {avatarText}
        </Avatar>
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top',
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={(e) => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar>{avatarText}</Avatar>
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {userName}
                      </Typography>
                      <Typography variant='caption'>{userEmail}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  {/* <MenuItem className='mli-2 gap-3' onClick={(e) => handleDropdownClose(e)}>
                    <i className='tabler-user text-[22px]' />
                    <Typography color='text.primary'>My Profile</Typography>
                  </MenuItem> */}
                  {/* <MenuItem className='mli-2 gap-3' onClick={(e) => handleDropdownClose(e)}>
                    <i className='tabler-settings text-[22px]' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem> */}
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
