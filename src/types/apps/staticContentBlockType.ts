export type staticContentBlockType = {
  srNo?: number;
  sectionId?: number;
  sectionSlug:string;
  sectionName:string;
  createdAt: string;
  updatedAt: string | null;
};

export type filesDetailType = {
  srNo?: number;
  mediaId?: number;
  fileName:string;
  mediaType:string;
  filePath:string;
  createdAt: Date;
  updatedAt: Date;
};

// eslint-disable-next-line
export const ADD_File = -1
// eslint-disable-next-line
export const EDIT_File = 1
