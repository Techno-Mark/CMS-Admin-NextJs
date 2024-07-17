//redirections url
export const redirectToAddEvent = "/content-management/events/add";
export const redirectToEditEvent = (id: number | string) => {
  return `/content-management/events/edit/${id}`;
};

//api endpoints
export const getEventList = "event/list";

export const getEventById = (id: string | number) => {
  return `event/getById/${id}`;
};

export const createEvent = "event/create";

export const updateEvent = "event/update";

export const deleteEvent = "event/delete";
