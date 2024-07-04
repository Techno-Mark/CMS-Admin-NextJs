export type blogsType = {
  srNo?: number;
  blogId: number;
  blogTitle: string;
  blogSlug: string;
  authorName: string;
  // permissionDescription: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type blogDetailType = {
  srNo?: number;
  blogId: number;
  templateId: number;
  templateData: Object;
  title: string;
  slug: string;
  authorName: string;
  bannerImageUrl: string;
  thumbnailImageUrl: string;
  description: string;
  tags: String;
  categories: String;
  active: boolean;
  scheduleDate: Date;
  publishDate: Date;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ADD_BLOG = -1;
export const EDIT_BLOCK = 1;
