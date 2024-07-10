export const popups = {
  list: `organization/popup/list`,
  create: `organization/popup/create`,
  update: `organization/popup/update`,
  getById: `organization/popup/getById`,
  delete: `organization/popup/delete`,
  // active: `organization/active`,
};

export const redirectToEditPage = (id: number | string) => {
  return `/content-management/popups/edit/${id}`;
};

export const redirectToAddPage = "/content-management/popups/add";