export interface userType {
  srNo?: number;
  userId: number;
  userName: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface userDetailType {
  userId: number;
  userName: string;
  userEmail: string;
}
