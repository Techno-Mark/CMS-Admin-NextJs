"use client";
import React, { useState } from "react";
import DraggableIcon from "./_svg/DraggableIcon";
import { Box, Button, Card, Fab, Grid } from "@mui/material";
import KanbanDrawer from "../KanbanDrawer";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import BreadCrumbList from "@/components/BreadCrumbList";

const MenuItem: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<any[]>([
    {
      name: "Item 1",
      logo: "",
      link: "/item-1",
      children: [
        {
          name: "Subitem 1-1",
          children: [],
          logo: "",
          link: "/item-1",
        },
        { name: "Subitem 1-2", children: [], logo: "", link: "/item-1" },
        { name: "Subitem 1-3", children: [], logo: "", link: "/item-1" },
      ],
    },
    {
      name: "Item 2",
      children: [
        { name: "Subitem 2-1", children: [], logo: "", link: "/item-1" },
      ],
      logo: "",
      link: "/item-1",
    },
    {
      name: "Item 3",
      children: [
        { name: "Subitem 3-1", children: [], logo: "", link: "/item-1" },
        { name: "Subitem 3-2", children: [], logo: "", link: "/item-1" },
      ],
      logo: "",
      link: "/item-1",
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawer, setEditDrawer] = useState(false);
  const [editdata, setEditData] = useState<any>();

  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    index: number,
    parentId: number
  ) => {
    const data = {
      draggedIndex: index,
      draggedItemParentIndex: parentId,
    };
    e.dataTransfer.setData("text/plain", JSON.stringify(data));
  };

  const handleDropOver = (
    event: React.DragEvent<HTMLLIElement>,
    targetIndex: number,
    parentId: number
  ) => {
    event.preventDefault();
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLIElement>,
    targetIndex: number,
    parentId: number
  ) => {
    const data = JSON.parse(event.dataTransfer.getData("text/plain"));

    //Co-ordinates
    const targetElement = event.currentTarget as HTMLElement;
    const targetLeft = targetElement.getBoundingClientRect();
    const currentLeft = event.pageX;

    if (targetLeft.left + 180 > currentLeft) {
      console.log(targetLeft.left, currentLeft);
    }

    const newMenuItems = [...menuItems];

    const removedItem = removeMenuItem(newMenuItems, data);
    addMenuItem(newMenuItems, removedItem, targetIndex, parentId);

    return;
  };

  const addMenuItem = (
    newMenuItems: any,
    removedItem: any,
    targetIndex: number,
    parentId: number
  ) => {
    if (parentId == -1) {
      newMenuItems.splice(targetIndex, 0, removedItem);
      setMenuItems(newMenuItems);
    } else {
      newMenuItems[parentId].children.splice(targetIndex, 0, removedItem);
      setMenuItems(newMenuItems);
      console.log(targetIndex, parentId);
    }
  };

  const removeMenuItem = (newMenuItems: any, data: any) => {
    if (data.draggedItemParentIndex == -1) {
      const removedItem = menuItems[data.draggedIndex];
      newMenuItems.splice(data.draggedIndex, 1);
      return removedItem;
    } else {
      const removedItem =
        newMenuItems[data.draggedItemParentIndex].children[data.draggedIndex];
      newMenuItems[data.draggedItemParentIndex].children.splice(
        data.draggedIndex,
        1
      );
      return removedItem;
    }
  };

  const handleEdit = (index: number, parentId: number) => {
    setEditDrawer(true);
    setEditData({ index: index, parentId: parentId });
  };

  const handleDelete = () => {};

  const renderMenuItems = (items: any[], parentId: number): React.ReactNode => {
    return items.map((item, index) => (
      <ul key={index}>
        {" "}
        <li
          className="flex items-center border-b-black border-b p-1"
          draggable
          onDragStart={(e) => handleDragStart(e, index, parentId)}
          onDrop={(e) => handleDrop(e, index, parentId)}
          onDragOver={(e) => handleDropOver(e, index, parentId)}
        >
          <div className="flex-1 flex items-center">
            <DraggableIcon />
            {item.name}
          </div>
          <div className="flex rounded-md border cursor-pointer">
            <div className=" bg-white border-r p-1">
              <button
                className="bg-white text-black cursor-pointer"
                onClick={() => handleEdit(index, parentId)}
              >
                Edit
              </button>
            </div>
            <div className="p-1">
              <button className="bg-white cursor-pointer">Delete</button>
            </div>
          </div>
        </li>
        {item.children && renderMenuItems(item.children, index)}
      </ul>
    ));
  };
  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div className="bg-white p-2 max-w-[70%] m-auto">
          {renderMenuItems(menuItems, -1)}
          <Fab
            variant="extended"
            className="w-7 h-7"
            onClick={() => setDrawerOpen(true)}
          >
            <i className="tabler-plus mie-1" />
            Add
          </Fab>
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
        </div>
        <Box display="flex" gap={4}>
          <Grid container spacing={2} sm={12}>
            <Grid
              item
              xs={12}
              style={{ position: "sticky", bottom: 0, zIndex: 10 }}
            >
              <Box
                p={7}
                display="flex"
                gap={2}
                justifyContent="end"
                bgcolor="background.paper"
              >
                <Button
                  variant="contained"
                  color="error"
                  type="reset"
                  onClick={() => {
                    // handleClose();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  // onClick={() => handleSubmit(false)}
                >
                  {/* {open === sectionActions.ADD ? "Add" : "Edit"} Content Block */}{" "}
                  Save
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  );
};

export default MenuItem;
