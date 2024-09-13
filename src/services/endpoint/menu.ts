const commonPrefix = "organization/menu"

const commonMenuItem = "organization/menu/item"

export const menu = {
  // Menu Listing
  list: `${commonPrefix}/list`,
  delete: `${commonPrefix}/delete`,
  createAndUpdate: `${commonPrefix}/create-and-update`,
  getById: `${commonPrefix}/getById`,

  // Menu Item API Endpoint
  menuItemCreateAndUpdate: `${commonMenuItem}/create-and-update`,
  menuItemGetById: `${commonMenuItem}/getById`
}
