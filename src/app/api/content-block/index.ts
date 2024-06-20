//redirections url
export const redirectToAddPage = "/settings/content-blocks/add"
export const redirectToEditPage = (slug: number | string) => { return `/settings/content-blocks/edit/${slug}` }


//api endpoints
export const getSectionList = "section/list"

export const getSectionById = (slug: string | number) => { return `section/getBySlug/${slug}` }

export const createSection = "section/create"

export const updateSection = "section/update"

export const deleteSection = "section/delete"