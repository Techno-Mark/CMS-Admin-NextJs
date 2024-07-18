export type menuType = {
  srNo?: number;
  menuId: number;
  menuName: string;
  menuLocation: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type menuDetailType = {
  menuId: number;
  menuName: string;
  menuLocation: string;
  active: boolean;
};
