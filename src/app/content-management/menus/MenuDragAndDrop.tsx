"use client";
import React, { useState } from "react";
import MenuItem, { MenuItemType } from "./MenuItem";
export interface MenuItemType1 {
  id: string;
  name: string;
  children?: MenuItemType1[];
}

function MenuDragAndDrop() {
  const [menuItems, setMenuItems] = useState<MenuItemType1[]>([
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
  const [draggedItem, setDraggedItem] = useState<MenuItemType | null>(null);

  const onDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    item: MenuItemType
  ) => {
    setDraggedItem(item);
  };

  const onDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const onDrop = (
    e: React.DragEvent<HTMLLIElement>,
    targetItem: MenuItemType
  ) => {
    e.preventDefault();
    if (draggedItem && draggedItem.id !== targetItem.id) {
      const updatedMenuItems = moveItem(menuItems, draggedItem, targetItem);
      setMenuItems(updatedMenuItems);
    }
  };

  const moveItem = (
    items: MenuItemType1[],
    itemToMove: MenuItemType1,
    targetItem: MenuItemType1
  ): MenuItemType1[] => {
    const removeItem = (
      items: MenuItemType1[],
      id: string
    ): MenuItemType1[] => {
      return items
        .filter((item) => item.id !== id)
        .map((item) => ({
          ...item,
          children: item.children ? removeItem(item.children, id) : [],
        }));
    };

    const insertItem = (
      items: MenuItemType1[],
      newItem: MenuItemType1,
      targetId: string
    ): MenuItemType1[] => {
      return items.map((item) => {
        if (item.id === targetId) {
          return {
            ...item,
            children: item.children ? [...item.children, newItem] : [newItem],
          };
        }
        if (item.children) {
          return {
            ...item,
            children: insertItem(item.children, newItem, targetId),
          };
        }
        return item;
      });
    };

    const newItems = removeItem(items, itemToMove.id);
    return insertItem(newItems, itemToMove, targetItem.id);
  };

  const renderMenuItems = (items: MenuItemType1[]): React.ReactNode => {
    return items.map((item) => (
      <MenuItem
        key={item.id}
        item={item}
        onDragStart={onDragStart}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {item.children && renderMenuItems(item.children)}
      </MenuItem>
    ));
  };

  return <div className="bg-white">{renderMenuItems(menuItems)};</div>;
}

export default MenuDragAndDrop;
