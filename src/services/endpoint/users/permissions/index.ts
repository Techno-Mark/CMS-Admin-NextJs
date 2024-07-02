//redirections url
export const redirectToAddPage = "/users/permissions/add"
export const redirectToEditPage = (id: number | string) => { return `/users/permissions/edit/${id}` }


//api endpoints
export const getPermissionsList = "permission/list"

export const getPermissionById = (id: string | number) => { return `permission/getById/${id}` }

export const createPermission = "permission/create"

export const updatePermission = "permission/update"

export const deletePermission = "permission/delete"