export type RolesType = {
    srNo?: number;
    roleId: number;
    roleName: string;
    roleDescription: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export type ADD_ROLE = -1
export type EDIT_ROLE = 1
