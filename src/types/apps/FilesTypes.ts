export type filesType = {
  srNo?: number;
  mediaId?: number;
  fileName:string;
  filePath:string;
  mediaType:string;
  active: boolean;
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

export const ADD_File = -1
export const EDIT_File = 1
