export type ModulesType = {
    srNo?: number;
    moduleId: number;
    moduleName: string;
    status:boolean;
    active: boolean;
    createdAt: string;
    updatedAt: string | null;
}

export type ADD_PERMISSION = -1
export type EDIT_PERMISSION = 1
