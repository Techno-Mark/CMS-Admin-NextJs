"use client"
import React, { useState } from "react"
import { Box, Button, Card, Fab, Grid, IconButton, styled, Tooltip, Typography } from "@mui/material"
import KanbanDrawer from "./KanbanDrawer"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import BreadCrumbList from "@/components/BreadCrumbList"
import DraggableIcon from "../_svg/DraggableIcon"
import { postDataToOrganizationAPIs } from "@/services/apiService"
import { menu } from "@/services/endpoint/menu"
import { toast } from "react-toastify"
import ConfirmationDialog from "./ConfirmationDialog"
import CustomIconButton from '@core/components/mui/IconButton'

const MenuItem = ({
  menuData,
  menuId,
  handleClose,
  permissionUser
}: {
  menuData: any;
  menuId: string;
  handleClose: Function;
  permissionUser: Boolean
}) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [menuItems, setMenuItems] = useState<any[] | null>(menuData)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editDrawer, setEditDrawer] = useState(false)
  const [editdata, setEditData] = useState<any>()
  const [deleteDrawer, setDeleteDrawer] = useState<boolean>(false)
  const [deleteData, setDeleteData] = useState({
    index: -1,
    parentId: -1
  })

  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    index: number,
    parentId: number
  ) => {
    const data = {
      draggedIndex: index,
      draggedItemParentIndex: parentId
    }
    e.dataTransfer.setData("text/plain", JSON.stringify(data))
  }

  const handleDropOver = (
    event: React.DragEvent<HTMLLIElement>,
    targetIndex: number,
    parentId: number
  ) => {
    event.preventDefault()
  }

  const handleDrop = (
    event: React.DragEvent<HTMLLIElement>,
    targetIndex: number,
    parentId: number
  ) => {
    const data = JSON.parse(event.dataTransfer.getData("text/plain"))

    if (!menuItems) return

    if (
      data.draggedItemParentIndex === -1 &&
      menuItems[data.draggedIndex].children.length > 0 &&
      parentId !== -1
    ) {
      return
    }
    const newMenuItems = [...menuItems]

    const removedItem = removeMenuItem(newMenuItems, data)
    addMenuItem(newMenuItems, removedItem, targetIndex, parentId)
  }

  const addMenuItem = (
    newMenuItems: any,
    removedItem: any,
    targetIndex: number,
    parentId: number
  ) => {
    if (parentId == -1) {
      newMenuItems.splice(targetIndex, 0, removedItem)
      setMenuItems(newMenuItems)
    } else {
      newMenuItems[parentId].children.splice(targetIndex, 0, removedItem)
      setMenuItems(newMenuItems)
    }
  }

  const removeMenuItem = (newMenuItems: any, data: any) => {
    if (!menuItems) return

    if (data.draggedItemParentIndex == -1) {
      const removedItem = menuItems[data.draggedIndex]
      newMenuItems.splice(data.draggedIndex, 1)
      return removedItem
    } else {
      const removedItem =
        newMenuItems[data.draggedItemParentIndex].children[data.draggedIndex]
      newMenuItems[data.draggedItemParentIndex].children.splice(
        data.draggedIndex,
        1
      )
      return removedItem
    }
  }

  const handleEdit = (index: number, parentId: number) => {
    setEditDrawer(true)
    setEditData({ index, parentId })
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const response = await postDataToOrganizationAPIs(
        menu.menuItemCreateAndUpdate,
        {
          menuId,
          menuJSONData: menuItems
        }
      )

      setLoading(false)

      if (response.status === "success") {
        toast.success(response.message)
        handleClose()
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const MenuItemContainer = styled(Box)(({ theme }) => ({
    padding: "0.5rem 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${theme.palette.divider}`,
    "&:hover": {
      backgroundColor: theme.palette.action.hover
    }
  }));

  const MenuItemActions = styled(Box)(({ theme }) => ({
    display: "flex",
    gap: "0.5rem"
  }));

  const NestedMenu = styled(Box)(({ theme }) => ({
    marginLeft: "1.5rem",
    paddingLeft: "1rem",
    borderLeft: `2px solid ${theme.palette.divider}`,
  }));

  const renderMenuItems = (items: any[], parentId: number): React.ReactNode => {
    const handleAddSubmenu = (parentIndex: number) => {
      const newItems = [...items];
      const newSubItem = {
        name: 'New Subitem',
        link: '#',
        children: [],
        logo: '#',
      };

      if (!newItems[parentIndex].children) {
        newItems[parentIndex].children = [];
      }
      newItems[parentIndex].children.push(newSubItem);
      setMenuItems(newItems);
    };
    const NestedMenu = styled(Box)(({ theme }) => ({
      marginLeft: "1.5rem",
      borderLeft: `2px solid ${theme.palette.divider}`
    }));

    return items.map((item, index) => (
      <ul key={index + 1}>


        <li
          className="flex items-center border-b-black border-b"
          draggable
          onDragStart={(e) => handleDragStart(e, index, -1)}
          onDrop={(e) => handleDrop(e, index, -1)}
          onDragOver={(e) => handleDropOver(e, index, -1)}
        >
          <CustomIconButton
            aria-label="Add Submenu"
            size="medium"
            variant="contained"
            color="primary"
            onClick={() => handleAddSubmenu(index)}
          >
            <i className="tabler-plus mie-1" />
          </CustomIconButton>

          <div className="flex-1 flex items-center gap-x-2">
            <DraggableIcon />
            <Typography variant="h5"> {item.name} </Typography>
            <Typography variant="subtitle1"> ({item.link}) </Typography>
          </div>




          <IconButton

            size="medium"
            // @ts-ignore
            color="success"
            onClick={() => handleEdit(index, -1)}
          >
            <i className="tabler-edit mie-1" />
          </IconButton>

          <IconButton
            size="medium"
            // @ts-ignore
            color="error"
            onClick={() => {
              setDeleteDrawer(true);
              setDeleteData({ index, parentId: -1 });
            }}
          >
            <i className="tabler-trash mie-1" />
          </IconButton>


        </li>

       
        <NestedMenu>
         
          {item.children && item.children.length > 0 && (
            <ul>
              {item.children.map((childItem: any, childIndex: number) => (
                <li
                  key={childIndex + 1}
                  className="flex items-center border-b-black border-b p-1"
                  draggable
                  onDragStart={(e) => handleDragStart(e, childIndex, index)}
                  onDrop={(e) => handleDrop(e, childIndex, index)}
                  onDragOver={(e) => handleDropOver(e, childIndex, index)}
                >
                  <div className="flex-1 flex items-center gap-x-2">
                    <DraggableIcon />
                    {childItem?.logo && childItem.logo !== "#" && (
                      <img src={childItem.logo} alt="icon" width={30} height={30} />
                    )}
                    <Typography variant="h5"> {childItem.name} </Typography>
                    <Typography variant="subtitle1"> ({childItem.link}) </Typography>
                  </div>

                  <IconButton

                    size="small"

                    // @ts-ignore
                    color="success"
                    onClick={() => handleEdit(childIndex, index)}
                  >
                    <i className="tabler-edit mie-1" />
                  </IconButton>



                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => {
                      setDeleteDrawer(true);
                      setDeleteData({ index: childIndex, parentId: index });
                    }}>
                    <i className='tabler-trash' />
                  </IconButton>


                </li>
              ))}
            </ul>
          )}

          {/* Placeholder for dropping sub-items */}
          {parentId == -1 && !item.children?.length && (
            <div
              className="m-2 ml-4"
              onDrop={(e: any) => handleDrop(e, 0, index)}
              onDragOver={(e: any) => handleDropOver(e, 0, index)}
            >
              Drop sub-item
            </div>
          )}
        </NestedMenu>
      </ul>
    ));
  };


  // const renderMenuItems = (items: any[], parentId: number): React.ReactNode => {
  //   return items.map((item, index) => (
  //     <ul key={index + 1}>

  //       <li
  //         className="flex items-center border-b-black border-b"
  //         draggable
  //         onDragStart={(e) => handleDragStart(e, index, -1)}
  //         onDrop={(e) => handleDrop(e, index, -1)}
  //         onDragOver={(e) => handleDropOver(e, index, -1)}
  //       >

  //         <CustomIconButton aria-label='Add Submenu' size="small" variant='contained' color="primary"
  //           onClick={() => setDrawerOpen(true)}>
  //           <i className="tabler-plus mie-1" />
  //         </CustomIconButton>

  //         {/* <Button color="success" size="small" variant="contained" >
  //             <i className="tabler-plus mie-1" />
  //           </Button> */}
  //         <div className="flex-1 flex items-center gap-x-2">
  //           <DraggableIcon />
  //           {/* <img src={item.logo} alt="icon" width={30} height={30} /> */}
  //           <Typography variant="h5"> {item.name} </Typography>
  //           <Typography variant="subtitle1"> ({item.link}) </Typography>
  //         </div>
  //         <div className="flex rounded-md border cursor-pointer">
  //           <div className=" bg-white border-r p-1">
  //             <button
  //               className="bg-white text-black cursor-pointer"
  //               onClick={() => handleEdit(index, -1)}
  //             >
  //               Edit
  //             </button>
  //           </div>
  //           <div className="p-1">
  //             <button
  //               onClick={() => {
  //                 setDeleteDrawer(true)
  //                 setDeleteData({ index, parentId: -1 })
  //               }}
  //               className="bg-white cursor-pointer"
  //             >
  //               Delete
  //             </button>
  //           </div>
  //         </div>
  //       </li>
  //       {parentId == -1 && !item.children?.length && (
  //         <div
  //           className="m-2 ml-4"
  //           onDrop={(e: any) => handleDrop(e, 0, index)}
  //           onDragOver={(e: any) => handleDropOver(e, 0, index)}
  //         >
  //           Drop sub-item
  //         </div>
  //       )}
  //       {item.children &&
  //         item.children?.map((childItem: any, childIndex: number) => (
  //           <ul key={childIndex + 1}>
  //             <li
  //               className="flex items-center border-b-black border-b p-1"
  //               draggable
  //               onDragStart={(e) => handleDragStart(e, childIndex, index)}
  //               onDrop={(e) => handleDrop(e, childIndex, index)}
  //               onDragOver={(e) => handleDropOver(e, childIndex, index)}
  //             >
  //               <div className="flex-1 flex items-center gap-x-2">
  //                 <DraggableIcon />
  //                 {childItem?.logo && childItem.logo !== "#" && (
  //                   // eslint-disable-next-line
  //                   <img
  //                     src={childItem.logo}
  //                     alt="icon"
  //                     width={30}
  //                     height={30}
  //                   />
  //                 )}
  //                 <Typography variant="h5"> {childItem.name} </Typography>
  //                 <Typography variant="subtitle1">
  //                   {" "}
  //                   ({childItem.link}){" "}
  //                 </Typography>
  //               </div>
  //               <div className="flex rounded-md border cursor-pointer">
  //                 <div className=" bg-white border-r p-1">
  //                   <button
  //                     className="bg-white text-black cursor-pointer"
  //                     onClick={() => handleEdit(childIndex, index)}
  //                   >
  //                     Edit
  //                   </button>
  //                 </div>
  //                 <div className="p-1">
  //                   <button
  //                     onClick={() => {
  //                       setDeleteDrawer(true)
  //                       setDeleteData({ index: childIndex, parentId: index })
  //                     }}
  //                     className="bg-white cursor-pointer"
  //                   >
  //                     Delete
  //                   </button>
  //                 </div>
  //               </div>
  //             </li>
  //           </ul>
  //         ))}
  //     </ul>
  //   ))
  // }
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div className="bg-white p-1 max-w-[70%] m-auto">
          {menuItems ? (

            renderMenuItems(menuItems, -1)
          ) : (
            <p className="text-xl p-4">
              {" "}
              No Menu Created Yet, Add new Menu and save
            </p>
          )}
          {permissionUser &&
            // <Fab
            //   variant="extended"
            //   className="w-13 h-7 m-4"
            //   onClick={() => setDrawerOpen(true)}
            // >
            //   <i className="tabler-plus mie-1" />
            //   Add
            // </Fab>

            <Button color="success" size="small" variant="contained" onClick={() => setDrawerOpen(true)}>
              <i className="tabler-plus mie-1" />
              Add
            </Button>
          }
          {drawerOpen && (
            <KanbanDrawer
              drawerOpen={drawerOpen}
              setDrawerOpen={setDrawerOpen}
              dataRequired={null}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              open={-1}
            />
          )}
          {editDrawer && (
            <KanbanDrawer
              drawerOpen={editDrawer}
              setDrawerOpen={setEditDrawer}
              dataRequired={editdata}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              open={1}
            />
          )}
          {deleteDrawer && (
            <ConfirmationDialog
              setOpen={setDeleteDrawer}
              menuItems={menuItems}
              setMenuItems={setMenuItems}
              deleteData={deleteData}
            />
          )}
        </div>
        <Box display="flex" gap={2}>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              style={{ position: "sticky", bottom: 0, zIndex: 10 }}
            >
              <Box
                p={2}
                display="flex"
                gap={2}
                justifyContent="end"
                bgcolor="background.paper"
              >
                <Button
                  variant="contained"
                  color="error"
                  type="reset"
                  onClick={() => handleClose()}
                >
                  Cancel
                </Button>
                {permissionUser &&
                  <Button variant="contained" onClick={() => handleSubmit()}>
                    Save
                  </Button>
                }
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  )
}

export default MenuItem
