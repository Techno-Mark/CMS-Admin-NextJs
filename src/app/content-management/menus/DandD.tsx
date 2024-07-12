"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import MenuItem from "./MenuItem";

export interface MenuItemType {
  id: string;
  name: string;
  children?: MenuItemType[];
}

const Menu: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([
    {
      id: "1",
      name: "Item 1",
      children: [
        {
          id: "1-1",
          name: "Subitem 1-1",
          children: [
            { id: "1-1-1", name: "Sub-subitem 1-1-1" },
            { id: "1-1-2", name: "Sub-subitem 1-1-2" },
          ],
        },
        { id: "1-2", name: "Subitem 1-2" },
      ],
    },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
  ]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newMenuItems = reorder(
      menuItems,
      result.source.index,
      result.destination.index
    );
    setMenuItems(newMenuItems);
  };

  const reorder = (
    list: MenuItemType[],
    startIndex: number,
    endIndex: number
  ): MenuItemType[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const renderMenuItems = (items: MenuItemType[]): React.ReactNode => {
    return items.map((item, index) => (
      <MenuItem key={item.id} item={item} index={index}>
        {item.children && renderMenuItems(item.children)}
      </MenuItem>
    ));
  };

  return (
    <div className="bg-white">
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="menu">
          {(provided) => (
            <ul ref={provided.innerRef} {...provided.droppableProps}>
              {renderMenuItems(menuItems)}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default Menu;
