export type eventsType = {
  srNo?: number;
  eventId: number;
  title: string;
  date: String;
  startTime: String;
  endTime: String;
  active: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type eventDetailType = {
  eventId: number;
  title: string;
  slug: string;
  date: Date | null;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  featureImageUrl: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  registrationLink: string;
  active: boolean;
};

export const ADD_EVENT = -1;
export const EDIT_EVENT = 1;
