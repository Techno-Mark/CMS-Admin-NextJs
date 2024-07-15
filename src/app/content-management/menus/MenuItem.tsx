"use client";
import React, { useState } from "react";
import DraggableIcon from "./_svg/_DraggableIcon";

const MenuItem: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([
    {
      name: "Item 1",
      logo: "",
      link: "",
      children: [
        {
          name: "Subitem 1-1",
          children: [],
          logo: "",
          link: "",
        },
        { name: "Subitem 1-2", children: [], logo: "", link: "" },
        { name: "Subitem 1-3", children: [], logo: "", link: "" },
      ],
    },
    {
      name: "Item 2",
      children: [{ name: "Subitem 2-1", children: [], logo: "", link: "" }],
      logo: "",
      link: "",
    },
    {
      name: "Item 3",
      children: [
        { name: "Subitem 3-1", children: [], logo: "", link: "" },
        { name: "Subitem 3-2", children: [], logo: "", link: "" },
      ],
      logo: "",
      link: "",
    },
  ]);

  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    item: any,
    index: number
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(index));
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLIElement>,
    targetItem: any,
    targetIndex: number
  ) => {
    const draggedIndex: number = Number(
      JSON.parse(event.dataTransfer.getData("text/plain"))
    );

    const newMenuItems = [...menuItems];

    const removedItem = removeMenuItem(newMenuItems, draggedIndex);
    addMenuItem(newMenuItems, removedItem, targetIndex);

    return;
  };

  const addMenuItem = (
    newMenuItems: any,
    removedItem: any,
    targetIndex: number
  ) => {
    newMenuItems.splice(targetIndex, 0, removedItem);
    console.log(newMenuItems);
    setMenuItems(newMenuItems);
  };
  const removeMenuItem = (newMenuItems: any, draggedIndex: number) => {
    const removedItem = menuItems[draggedIndex];
    newMenuItems.splice(draggedIndex, 1);
    return removedItem;
  };

  const renderMenuItems = (items: any[]): React.ReactNode => {
    return items.map((item, index) => (
      <ul key={index}>
        {" "}
        <li
          className="flex items-center border-b-black border-b p-1"
          draggable
          onDragStart={(e) => handleDragStart(e, item, index)}
          onDrop={(e) => handleDrop(e, item, index)}
          onDragOver={(e: React.DragEvent<HTMLLIElement>) => e.preventDefault()}
        >
          <div className="flex-1 flex items-center">
            <DraggableIcon />
            {item.name}
          </div>
          <div className="flex rounded-md border cursor-pointer">
            <div className=" bg-white border-r p-1">
              <button className="bg-white text-black cursor-pointer">
                Edit
              </button>
            </div>
            <div className="p-1">
              <button className="bg-white cursor-pointer">Delete</button>
            </div>
          </div>
        </li>
        {item.children && renderMenuItems(item.children)}
      </ul>
    ));
  };
  return (
    <div className="bg-white p-3 max-w-[70%] m-auto">
      {renderMenuItems(menuItems)}
    </div>
  );
};

export default MenuItem;
