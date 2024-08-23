"use client";
import React, { useState } from "react";
import DraggableIcon from "./_svg/DraggableIcon";
import { Box, Button, Card, Fab, Grid } from "@mui/material";
import KanbanDrawer from "../KanbanDrawer";
import LoadingBackdrop from "@/components/LoadingBackdrop";
import BreadCrumbList from "@/components/BreadCrumbList";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const MenuItem: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<any[]>([
    {
      id: "1",
      name: "Item 1",
      logo: "",
      link: "/item-1",
      children: [
        { id: "1-1", name: "Subitem 1-1", children: [], logo: "", link: "/item-1" },
        { id: "1-2", name: "Subitem 1-2", children: [], logo: "", link: "/item-1" },
        { id: "1-3", name: "Subitem 1-3", children: [], logo: "", link: "/item-1" },
      ],
    },
    {
      id: "2",
      name: "Item 2",
      children: [
        { id: "2-1", name: "Subitem 2-1", children: [], logo: "", link: "/item-1" },
      ],
      logo: "",
      link: "/item-1",
    },
    {
      id: "3",
      name: "Item 3",
      children: [
        { id: "3-1", name: "Subitem 3-1", children: [], logo: "", link: "/item-1" },
        { id: "3-2", name: "Subitem 3-2", children: [], logo: "", link: "/item-1" },
      ],
      logo: "",
      link: "/item-1",
    },
  ]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editDrawer, setEditDrawer] = useState(false);
  const [editData, setEditData] = useState<any>();

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    // Exit if there's no destination
    if (!destination) return;

    const sourceParentId = source.droppableId === "root" ? -1 : parseInt(source.droppableId);
    const destinationParentId = destination.droppableId === "root" ? -1 : parseInt(destination.droppableId);

    const newMenuItems = [...menuItems];

    // Remove the dragged item from its original position
    const removedItem = removeMenuItem(newMenuItems, {
      draggedIndex: source.index,
      draggedItemParentIndex: sourceParentId,
    });

    // Add the dragged item to its new position
    addMenuItem(newMenuItems, removedItem, destination.index, destinationParentId);

    setMenuItems(newMenuItems);
  };

  const addMenuItem = (
    newMenuItems: any,
    removedItem: any,
    targetIndex: number,
    parentId: number
  ) => {
    if (parentId === -1) {
      newMenuItems.splice(targetIndex, 0, removedItem);
    } else {
      newMenuItems[parentId].children.splice(targetIndex, 0, removedItem);
    }
    setMenuItems(newMenuItems);
  };

  const removeMenuItem = (newMenuItems: any, data: any) => {
    if (data.draggedItemParentIndex === -1) {
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
    setEditData({ index, parentId });
  };

  const renderMenuItems = (items: any[], parentId: number): React.ReactNode => {
    return (
      <Droppable droppableId={parentId === -1 ? "root" : `${parentId}`}>
        {(provided) => (
          <ul ref={provided.innerRef} {...provided.droppableProps}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <>
                  <li
                    className="flex items-center border-b-black border-b p-1"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <div className="flex-1 flex items-center">
                      <DraggableIcon />
                      {item.name}
                    </div>
                    <div className="flex rounded-md border cursor-pointer">
                      <div className="bg-white border-r p-1">
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
                    </>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    );
  };

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <BreadCrumbList />
      <Card>
        <div className="bg-white p-2 max-w-[70%] m-auto">
          <DragDropContext onDragEnd={handleDragEnd}>
            {renderMenuItems(menuItems, -1)}
          </DragDropContext>
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
              dataRequired={editData}
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
                <Button variant="contained" color="error" type="reset">
                  Cancel
                </Button>
                <Button variant="contained">Save</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </>
  );
};

export default MenuItem;
