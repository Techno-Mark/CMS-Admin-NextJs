export type TaskType = {
  id: number;
  title: string;
  badgeText?: string[];
  attachments?: number;
  comments?: number;
  assigned?: { src: string; name: string }[];
  image?: string;
  dueDate?: Date;
};

export type ColumnType = {
  id: number;
  title: string;
  taskIds: number[];
};

export type MenuType = {
  id: number;
  title: string;
  link: string;
};

export type KanbanType = {
  menus: MenuType[];
  columns: ColumnType[];
  tasks: TaskType[];
  currentTaskId?: number;
};
