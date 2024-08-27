export type PermissionsType = {
    srNo?: number;
    permissionId: number;
    permissionName: string;
    permissionDescription: string | null;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export type ADD_Modules = -1
export type EDIT_Modules = 1
