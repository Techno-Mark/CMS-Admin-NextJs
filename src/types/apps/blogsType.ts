export type blogsType = {
  srNo?: number;
  blogId: number;
  blogTitle: string;
  blogSlug: string;
  // permissionDescription: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};
