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

export const ADD_File = -1;
export const EDIT_File = 1;
