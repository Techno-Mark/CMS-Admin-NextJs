import { useRef, useState, useEffect } from 'react';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

// Hook Imports
import { useSettings } from '@core/hooks/useSettings';

// API Imports
import { organization } from "@/services/endpoint/organization";
import { post } from "@/services/apiService";

interface Organization {
  id: string;
  name: string;
}

const ModeDropdown = () => {
  const [open, setOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const anchorRef1 = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await post(organization.active, {});
        const orgs = response.data.organizations as Organization[];
        setOrganizations(orgs);
        
        const storedOrgId = localStorage.getItem('selectedOrgId');
        console.log(storedOrgId);
        if (storedOrgId) {
          
          
          setSelectedOrgId(storedOrgId);
        } else if (orgs.length > 0) {
          setSelectedOrgId(orgs[0].id);
          localStorage.setItem('selectedOrgId', orgs[0].id);
        }
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };

    fetchOrganizations();
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle1 = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleModeSwitch = (orgId: string) => {
    setSelectedOrgId(orgId);
    localStorage.setItem('selectedOrgId', orgId);
    handleClose();
  };

  const selectedOrgName = organizations.find((org) => org.id === selectedOrgId)?.name || 'Select Organization';
  const avatarText = selectedOrgName.split(' ').map((n) => n[0]).join('');

  return (
    <>
      <Badge
        ref={anchorRef1}
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className="mis-2 flex items-center justify-center cursor-pointer"
        onClick={handleToggle1}
      >
        <Avatar alt={selectedOrgName} className="cursor-pointer bs-[38px] is-[38px]">
          {avatarText}
        </Avatar>
        <Typography className="font-medium ml-2 mr-1" color="text.primary">
          {selectedOrgName}
        </Typography>
        <i className={`tabler-chevron-down ${open ? 'transform rotate-180' : ''}`} />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement="bottom-start"
        anchorEl={anchorRef1.current}
        className="min-is-[160px] !mbs-3 z-[1]"
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-start' ? 'left top' : 'right top',
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList onKeyDown={handleClose}>
                  {organizations.map((org) => (
                    <MenuItem
                      key={org.id}
                      className="gap-3"
                      onClick={() => handleModeSwitch(org.id)}
                      selected={selectedOrgId === org.id}
                    >
                      <Avatar
                        alt={org.name}
                        className="cursor-pointer bs-[38px] is-[38px]"
                      >
                        {org.name.charAt(0)}
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
  );
};

export default ModeDropdown;
