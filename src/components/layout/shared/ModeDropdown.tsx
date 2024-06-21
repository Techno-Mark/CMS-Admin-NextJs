'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

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
import { organization } from "@/services/endpoint/organization";
import { post } from "@/services/apiService";

// Type Imports
import type { Mode } from '@core/types'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

const ModeDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [orgs, setOrgs] = useState([])
  const [tooltipOpen, setTooltipOpen] = useState(false)
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const anchorRef = useRef<HTMLButtonElement>(null)

  const generateAvatar = (text) => {
    return text.split(' ').map(n => n[0]).join('');
  }

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

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const result = await post(organization.active, {});
        if(result?.data?.organizations){
          setOrgs(result.data.organizations);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

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
          {generateAvatar("Technomark")}
        </Avatar>
        <Typography className='font-medium text-v-center ml-2' color='text.primary' ref={anchorRef}>
          Techno Mark
        </Typography>
        <i className='tabler-chevron-down text-v-center' />
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
                  {orgs.map(org=>(
                    <MenuItem
                      className='gap-3'
                      onClick={() => handleModeSwitch('light')}
                      selected={settings.mode === 'light'}

                    >
                      <Avatar
                        alt={org.name}
                        className='cursor-pointer bs-[38px] is-[38px]'
                      >
                        {generateAvatar(org.name)}
                      </Avatar>
                      {org.name}
                    </MenuItem>
                  ))}
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
