// Third-party Imports
import classnames from "classnames";

// Component Imports
import KanbanBoard from "@/app/content-management/menus/_kanban/KanbanBoard";

// Util Imports
import { commonLayoutClasses } from "@layouts/utils/layoutClasses";

// Styles Imports
import styles from "./_kanban/styles.module.css";
import MenuListTable from "./MenusListTable";

const KanbanPage = () => {
  return <MenuListTable />;
};

export default KanbanPage;
