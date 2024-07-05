//redirections url
export const redirectToAddPage = "/settings/content-blocks/add"
export const redirectToEditPage = (id: number | string) => { return `/settings/content-blocks/edit/${id}` }


//api endpoints
export const getSectionList = "section/list"

export const getSectionById = (id: string | number) => { return `section/getById/${id}` }

export const createSection = "section/create"

export const updateSection = "section/update"

export const deleteSection = "section/delete"

