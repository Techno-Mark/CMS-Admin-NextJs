"use client";
import React, { useState } from "react";
import DraggableIcon from "./_svg/_DraggableIcon";

const MenuItem: React.FC = () => {
  const [menuItems, setMenuItems] = useState<any[]>([
    {
      id: "1",
      name: "Item 1",
      children: [
        {
          id: "1-1",
          name: "Subitem 1-1",
        },
        { id: "1-2", name: "Subitem 1-2" },
      ],
    },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
  ]);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, item: any) => {
    e.dataTransfer.setData("text/plain", JSON.stringify(item));
    console.log(item);
  };

  const handleDrop = (
    event: React.DragEvent<HTMLLIElement>,
    targetItem: any
  ) => {
    const draggedItem: any = JSON.parse(
      event.dataTransfer.getData("text/plain")
    );
    console.log("on drop", draggedItem, targetItem);

    if (draggedItem.id === targetItem.id) return;

    let newItem = [...menuItems];

    if (!draggedItem.id.includes("-")) {
      let index = newItem.indexOf((item: any) => item.id == draggedItem.id);
      newItem.splice(index, 1, []);
      newItem = newItem.filter((item: any) => {
        item.id !== draggedItem.id;
      });
    }

    const removeItem = (items: any[], id: string): any[] => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.id === id) {
          items.splice(i, 1);
          return items;
        }
        if (item.children) {
          item.children = removeItem(item.children, id);
        }
      }
      return items;
    };
  };

  const renderMenuItems = (items: any[]): React.ReactNode => {
    return items.map((item) => (
      <ul>
        {" "}
        <li
          className="flex items-center border-b-black border-b p-1"
          draggable
          onDragStart={(e) => handleDragStart(e, item)}
          onDrop={(e) => handleDrop(e, item)}
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
