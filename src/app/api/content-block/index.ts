type Request = {
    pathName: string, method: "get" | "post"
}


export const getSectionList: Request = {
    pathName: "/api/section/list", method: "post"
}

export const getSectionById = (id: number): Request => {
    return { pathName: `/api/section/getById/${id}`, method: "post" }
}

export const createSection: Request = {
    pathName: "/api/section/create", method: "post"
}
export const updateSection: Request = {
    pathName: "/api/section/update", method: "post"
}

export const deleteSection: Request = {
    pathName: "/api/section/delete", method: "post"
}