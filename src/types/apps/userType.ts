export interface userType {
  srNo?: number;
  UserId: number;
  Username: string;
  Email:string;
  Roles: string;
  role: string;
  Status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface userDetailType {
  userId: number;
  userName: string;
  userEmail: string;
}
