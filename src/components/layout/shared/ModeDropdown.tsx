'use client'

// React Imports
import { useRef, useState } from 'react'

// MUI Imports
import Tooltip from '@mui/material/Tooltip'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

// Type Imports
import type { Mode } from '@core/types'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState(false)

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  const avatarText = "Techno Mark".split(' ').map(n => n[0]).join('')

  // Hooks
  const { settings, updateSettings } = useSettings()

  const handleClose = () => {
    setOpen(false)
    setTooltipOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const handleModeSwitch = (mode: Mode) => {
    handleClose()
  }

  const getModeIcon = () => {
    if (settings.mode === 'system') {
      return 'tabler-device-laptop'
    } else if (settings.mode === 'dark') {
      return 'tabler-moon-stars'
    } else {
      return 'tabler-sun'
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2 flex item-center justify-center'
        onClick={handleToggle}
      >
        <Avatar
          alt={"Techno Mark"}
          className='cursor-pointer bs-[38px] is-[38px]'
        >
          {avatarText}
        </Avatar>
        <Typography className='font-medium' color='text.primary' ref={anchorRef}>
          Techno Mark
        </Typography>
        <i className='tabler-chevron-down' />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-start'
        anchorEl={anchorRef.current}
        className='min-is-[160px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{ transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top' }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  <MenuItem
                    className='gap-3'
                    onClick={() => handleModeSwitch('light')}
                    selected={settings.mode === 'light'}
                  >
                    <Avatar
                      alt={"Techno Mark"}
                      className='cursor-pointer bs-[38px] is-[38px]'
                    >
                      {avatarText}
                    </Avatar>
                    Technomark
                  </MenuItem>
                  <MenuItem
                    className='gap-3'
                    onClick={() => handleModeSwitch('dark')}
                    selected={settings.mode === 'dark'}
                  >
                    <Avatar
                      alt={"Techno Mark"}
                      className='cursor-pointer bs-[38px] is-[38px]'
                    >
                      G
                    </Avatar>
                    Gyaata
                  </MenuItem>
                  <MenuItem
                    className='gap-3'
                    onClick={() => handleModeSwitch('system')}
                    selected={settings.mode === 'system'}
                  >
                    <Avatar
                      alt={"Techno Mark"}
                      className='cursor-pointer bs-[38px] is-[38px]'
                    >
                      P
                    </Avatar>
                    PABS
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default ModeDropdown
