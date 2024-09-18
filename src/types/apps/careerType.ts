/* eslint-disable semi */
export type careerType = {
  srNo?: number;
  careerId: number;
  jobTitle: string;
  yearsOfExperience: number;
  numberOfPosition: number;
  mode: string;
  location: string;
  detailPageSlug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type careerDetailType = {
  careerId: number;
  jobTitle: string;
  yearsOfExperience: number;
  numberOfPosition: number;
  mode: string;
  location: string;
  subTitle: string;
  description: string;
  active: boolean;
};

export const ADD_CAREER = -1;
export const EDIT_CAREER = 1;
