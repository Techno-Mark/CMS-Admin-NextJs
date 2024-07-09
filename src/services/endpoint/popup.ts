export const pages = {
  list: `popups/list`,
  create: `popups/create`,
  update: `popups/update`,
  getById: `popups/getById`,
  delete: `popups/delete`,
  // active: `organization/active`,
};

export const redirectToEditPage = (id: number | string) => {
  return `/content-management/popups/edit/${id}`;
};

export const redirectToAddPage = "/content-management/popups/add";