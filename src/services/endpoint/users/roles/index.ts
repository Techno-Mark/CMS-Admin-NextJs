//redirections url
export const redirectToAddPage = "/users/roles/add"
export const redirectToEditPage = (slug: number | string) => { return `/users/roles/edit/${slug}` }


//api endpoints
export const getRoleList = "role/list"

// export const getRoleById = (slug: string | number) => { return `role/getBySlug/${slug}` }

export const createRole = "role/create"

export const updateRole = "role/update"

export const deleteRole = "role/delete"