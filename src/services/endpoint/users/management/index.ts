//redirections url
export const redirectToAddPage = "/users/management/add";
export const redirectToEditPage = (id: number | string) => {
  return `/users/management/edit/${id}`;
};

//api endpoints
export const getUsersList = "users/management/list";

export const getUserById = (id: string | number) => {
  return `users/management/getById/${id}`;
};

export const createUser = "users/management/create";

export const updateUser = "users/management/update";

export const deleteUser = "users/management/delete";
