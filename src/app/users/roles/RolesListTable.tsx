// React Imports
import { useEffect, useState, useMemo } from "react";
// MUI Imports
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TablePagination from "@mui/material/TablePagination";
import type { TextFieldProps } from "@mui/material/TextField";
// Third-party Imports
import classnames from "classnames";
import { rankItem } from "@tanstack/match-sorter-utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFacetedMinMaxValues,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { RankingInfo } from "@tanstack/match-sorter-utils";
// Component Imports
import TablePaginationComponent from "@components/TablePaginationComponent";
import CustomTextField from "@core/components/mui/TextField";
// Style Imports
import tableStyles from "@core/styles/table.module.css";
import ConfirmationDialog from "./ConfirmationDialog";
import { useRouter } from "next/navigation";
import BreadCrumbList from "@components/BreadCrumbList";
// Type Imports
import { RolesType } from "@/types/apps/rolesType";
import {
  redirectToAddPage,
  redirectToEditPage,
} from "@/services/endpoint/users/roles";
import RoleCards from "./RolesCard";
import { Chip } from "@mui/material";
import { formatDate } from "@/utils/formatDate";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type RolesTypeWithAction = RolesType & {
  action?: string;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value);

  // Store the itemRank info
  addMeta({
    itemRank,
  });

  // Return if the item should be filtered in/out
  return itemRank.passed;
};

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<TextFieldProps, "onChange">) => {
  // States
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <CustomTextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

// Column Definitions
const columnHelper = createColumnHelper<RolesTypeWithAction>();

const RolesListTable = ({
  totalCount,
  tableData,
  getList,
  initialBody,
}: {
  totalCount: number;
  tableData?: RolesType[];
  getList: (arg1: {
    page: number;
    limit: number;
    search: string;
    organizationId: string | number;
  }) => void;
  initialBody: {
    page: number;
    limit: number;
    search: string;
    organizationId: number | string;
  };
}) => {
  const router = useRouter();
  // States
  const [globalFilter, setGlobalFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const columns = useMemo<ColumnDef<RolesTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1}
          </Typography>
        ),
      }),
      columnHelper.accessor("roleName", {
        header: "Role Name",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.roleName}
          </Typography>
        ),
      }),
      columnHelper.accessor("roleDescription", {
        header: "Description",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.roleDescription}
          </Typography>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {formatDate(row.original.createdAt)}
          </Typography>
        ),
      }),
      columnHelper.accessor("active", {
        header: "Status",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Chip
              variant="tonal"
              className="capitalize"
              label={row.original.active ? "Active" : "Inactive"}
              color={row.original.active ? "success" : "error"}
              size="small"
            />
          </div>
        ),
      }),
      columnHelper.accessor("roleId", {
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <IconButton
                onClick={() => {
                  router.push(redirectToEditPage(row.original.roleId));
                }}
              >
                <i className="tabler-edit text-[22px] text-textSecondary" />
              </IconButton>
              <IconButton
                onClick={() => {
                  setIsDeleting(true);
                  setDeletingId(row.original.roleId);
                }}
              >
                <i className="tabler-trash text-[22px] text-textSecondary" />
              </IconButton>
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tableData as RolesType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    initialState: {
      pagination: {
        pageIndex: initialBody.page,
        pageSize: initialBody.limit,
      },
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  useEffect(() => {
    getList({
      ...initialBody,
      page: table.getState().pagination.pageIndex,
      limit: table.getState().pagination.pageSize,
      search: globalFilter,
    });
  }, [
    table.getState().pagination.pageSize,
    table.getState().pagination.pageIndex,
    globalFilter,
  ]);

  useEffect(() => {
    if (deletingId === 0) {
      getList({
        ...initialBody,
        page: table.getState().pagination.pageIndex,
        limit: table.getState().pagination.pageSize,
        search: globalFilter,
      });
    }
  }, [deletingId]);

  return (
    <>
      <div className="my-2">
        <RoleCards />
      </div>
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center py-2 gap-4">
        <BreadCrumbList />
        <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
          <IconButton>
            <i className="tabler-filter text-[22px] text-textSecondary" />
          </IconButton>
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search"
            className="is-full sm:is-auto"
          />
          {/* <Button
            variant="contained"
            startIcon={<i className="tabler-plus" />}
            onClick={() => router.push(redirectToAddPage)}
            className="is-full sm:is-auto"
          >
            Add Role
          </Button> */}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto h-[340px]">
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <>
                          <div
                            className={classnames({
                              "flex items-center": header.column.getIsSorted(),
                              "cursor-pointer select-none":
                                header.column.getCanSort(),
                            })}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: <i className="tabler-chevron-up text-xl" />,
                              desc: (
                                <i className="tabler-chevron-down text-xl" />
                              ),
                            }[header.column.getIsSorted() as "asc" | "desc"] ??
                              null}
                          </div>
                        </>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {table.getFilteredRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan={table.getVisibleFlatColumns().length}
                    className="text-center"
                  >
                    No data available
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table
                  .getRowModel()
                  .rows.slice(0, table.getState().pagination.pageSize)
                  .map((row) => {
                    return (
                      <tr
                        key={row.id}
                        className={classnames({
                          selected: row.getIsSelected(),
                        })}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component={() => <TablePaginationComponent table={table} />}
          count={totalCount}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page);
          }}
        />
      </Card>
      <ConfirmationDialog
        open={isDeleting}
        setDeletingId={setDeletingId}
        setOpen={(arg1: boolean) => setIsDeleting(arg1)}
        deletePayload={{
          roleId: deletingId,
          organizationId: 1, // will be dynamic in future
        }}
      />
    </>
  );
};

export default RolesListTable;
