export const pages = {
  list: `organization/page/list`,
  create: `organization/page/create`,
  update: `organization/page/update`,
  getById: `organization/page/getById`,
  delete: `organization/page/delete`,
  fileUpoad: `upload`,
  active: `organization/page/active`,
  getPagePreviewData: 'get/page-preview-data'
}

export const redirectToEditPage = (id: number | string) => {
  return `/content-management/pages/edit/${id}`
}

export const redirectToAddPage = "/content-management/pages/add"
