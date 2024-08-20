//redirections url
export const redirectToAddPage = "/users/roles/add";
export const redirectToEditPage = (slug: number | string) => {
  return `/users/roles/edit/${slug}`;
};

//api endpoints
export const getRoleList = "role/list";

export const createRole = "role/create";

export const getRoleById = "role/getById";

export const updateRole = "role/update";

export const deleteRole = "role/delete";
