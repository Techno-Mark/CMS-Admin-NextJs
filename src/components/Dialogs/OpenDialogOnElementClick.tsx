"use client"

// React Imports
import type { ComponentType } from "react"

type OpenDialogOnElementClickProps = {
  element: ComponentType<any>;
  dialog: ComponentType<any>;
  elementProps?: any;
  dialogProps?: any;
  openDialog?: any;
  setOpenDialog?: any;
};

const OpenDialogOnElementClick = (props: OpenDialogOnElementClickProps) => {
  // Props
  const {
    element: Element,
    dialog: Dialog,
    elementProps,
    dialogProps,
    openDialog,
    setOpenDialog
  } = props

  // Extract onClick from elementProps
  const { onClick: elementOnClick, ...restElementProps } = elementProps

  // Handle onClick event
  const handleOnClick = (e: MouseEvent) => {
    elementOnClick && elementOnClick(e)
    setOpenDialog(true)
  }

  return (
    <>
      {/* Receive element component as prop and we will pass onclick event which changes state to open */}
      <Element onClick={handleOnClick} {...restElementProps} />
      {/* Receive dialog component as prop and we will pass open and setOpen props to that component */}
      <Dialog open={openDialog} setOpen={setOpenDialog} {...dialogProps} />
    </>
  )
}

export default OpenDialogOnElementClick
