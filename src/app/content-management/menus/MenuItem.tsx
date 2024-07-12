"use client";
import React, { useState } from "react";
import DraggableIcon from "./_svg/_DraggableIcon";
import { Button } from "@mui/material";

const MenuItem: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([
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

  const renderMenuItems = (items: any[]): React.ReactNode => {
    return items.map((item) => (
      <ul>
        {" "}
        <li className="flex items-center border-b-black border-b p-1">
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
