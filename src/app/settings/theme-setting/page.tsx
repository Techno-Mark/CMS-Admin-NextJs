"use client"
// React Imports
import { useState } from "react"
import type { SyntheticEvent } from "react"

// MUI Imports
import Tab from "@mui/material/Tab"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import TabContext from "@mui/lab/TabContext"
import Typography from "@mui/material/Typography"
import ButtonThemeSetting from "./buttonSetting"
import FontThemeSetting from "./fontSetting"
import SocialThemeSetting from "./socialMediaSetting"

const ThemeSetting = () => {
  // States
  const [value, setValue] = useState<string>("1")

  const handleChange = (event: SyntheticEvent, newValue: string) => {
    setValue(newValue)
  }

  return (
    <TabContext value={value}>
      <TabList onChange={handleChange} aria-label="simple tabs example">
        <Tab value="1" label="Button Color" />
        <Tab value="2" label="Font Color" />
        <Tab value="3" label="Social Media Links" />

      </TabList>
      <TabPanel value="1">
        <Typography>
          <ButtonThemeSetting />
        </Typography>
      </TabPanel>
      <TabPanel value="2">
        <Typography>
          <FontThemeSetting />
        </Typography>
      </TabPanel>
      <TabPanel value="3">
        <Typography>
         <SocialThemeSetting />
        </Typography>
      </TabPanel>
    </TabContext>
  )
}

export default ThemeSetting
