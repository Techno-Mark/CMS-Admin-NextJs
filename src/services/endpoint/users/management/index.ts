// redirections url
export const redirectToAddPage = "/users/management/add"
export const redirectToEditPage = (id: number | string) => {
  return `/users/management/edit/${id}`
}

// api endpoints
export const getUsersList = "users/list"

export const getUserById = "users/getById"

export const createUser = "users/create"

export const updateUser = "users/update"

export const deleteUser = "users/delete"
