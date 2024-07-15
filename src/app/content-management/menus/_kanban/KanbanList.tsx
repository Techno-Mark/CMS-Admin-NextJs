// React Imports
import { useEffect, useState } from "react";
import type { FormEvent, RefObject } from "react";

// Third-party imports
import { useDragAndDrop } from "@formkit/drag-and-drop/react";
import { animations } from "@formkit/drag-and-drop";

// Type Imports
import type {
  TaskType,
  ColumnType,
  KanbanType,
} from "@/types/apps/kanbanTypes";
import type { AppDispatch } from "@/redux-store";

// Slice Imports
import {
  addTask,
  editColumn,
  deleteColumn,
  updateColumnTaskIds,
} from "@/redux-store/slices/kanban";

import TaskCard from "./TaskCard";
import NewTask from "./NewTask";

type KanbanListProps = {
  column: ColumnType;
  tasks: (TaskType | undefined)[];
  dispatch: AppDispatch;
  store: KanbanType;
  setDrawerOpen: (value: boolean) => void;
  columns: ColumnType[];
  setColumns: (value: ColumnType[]) => void;
  currentTask: TaskType | undefined;
};

const KanbanList = (props: KanbanListProps) => {
  // Props
  const {
    column,
    tasks,
    dispatch,
    store,
    setDrawerOpen,
    columns,
    setColumns,
    currentTask,
  } = props;

  // States
  const [editDisplay, setEditDisplay] = useState(false);
  const [title, setTitle] = useState(column.title);

  // Hooks
  const [tasksListRef, tasksList, setTasksList] = useDragAndDrop(tasks, {
    group: "tasksList",
    plugins: [animations()],
    draggable: (el) => el.classList.contains("item-draggable"),
  });

  // Add New Task
  const addNewTask = (title: string) => {
    dispatch(addTask({ columnId: column.id, title: title }));

    setTasksList([
      ...tasksList,
      { id: store.tasks[store.tasks.length - 1].id + 1, title },
    ]);

    const newColumns = columns.map((col) => {
      if (col.id === column.id) {
        return {
          ...col,
          taskIds: [...col.taskIds, store.tasks[store.tasks.length - 1].id + 1],
        };
      }

      return col;
    });

    setColumns(newColumns);
  };

  // Handle Submit Edit
  const handleSubmitEdit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditDisplay(!editDisplay);
    dispatch(editColumn({ id: column.id, title }));

    const newColumn = columns.map((col) => {
      if (col.id === column.id) {
        return { ...col, title };
      }

      return col;
    });

    setColumns(newColumn);
  };

  // Cancel Edit
  const cancelEdit = () => {
    setEditDisplay(!editDisplay);
    setTitle(column.title);
  };

  // Delete Column
  const handleDeleteColumn = () => {
    dispatch(deleteColumn({ columnId: column.id }));
    setColumns(columns.filter((col) => col.id !== column.id));
  };

  // Update column taskIds on drag and drop
  useEffect(() => {
    if (tasksList !== tasks) {
      dispatch(updateColumnTaskIds({ id: column.id, tasksList }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasksList]);

  // To update the tasksList when a task is edited
  useEffect(() => {
    const newTasks = tasksList.map((task) => {
      if (task?.id === currentTask?.id) {
        return currentTask;
      }

      return task;
    });

    if (
      currentTask !== tasksList.find((task) => task?.id === currentTask?.id)
    ) {
      setTasksList(newTasks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTask]);

  // To update the tasksList when columns are updated
  useEffect(() => {
    let taskIds: ColumnType["taskIds"] = [];

    columns.map((col) => {
      taskIds = [...taskIds, ...col.taskIds];
    });

    const newTasksList = tasksList.filter(
      (task) => task && taskIds.includes(task.id)
    );

    setTasksList(newTasksList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  return (
    <div
      ref={tasksListRef as RefObject<HTMLDivElement>}
      className="flex flex-col is-[23.5rem]"
    >
      {tasksList.map(
        (task) =>
          task && (
            <TaskCard
              key={task.id}
              task={task}
              dispatch={dispatch}
              column={column}
              setColumns={setColumns}
              columns={columns}
              setDrawerOpen={setDrawerOpen}
              tasksList={tasksList}
              setTasksList={setTasksList}
            />
          )
      )}
      <NewTask addTask={addNewTask} />
    </div>
  );
};

export default KanbanList;
