"use client";

// React Imports
import { useEffect, useState, useMemo } from "react";

// MUI Imports
import Card from "@mui/material/Card";
import { Divider, Switch, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import TablePagination from "@mui/material/TablePagination";
import type { TextFieldProps } from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

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

// Type Imports
import type { OrganizationsType } from "@/types/apps/organizationsType";

// Component Imports
// import AddUserDrawer from "./AddUserDrawer";
import TablePaginationComponent from "@components/TablePaginationComponent";
import CustomTextField from "@core/components/mui/TextField";

// Style Imports
import tableStyles from "@core/styles/table.module.css";
import ConfirmationDialog from "./ConfirmationDialog";
import { useRouter } from "next/navigation";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type OrganizationsTypeWithAction = OrganizationsType & {
  action?: string;
};

//Enums
const ADD_DRAWER = -1;
const CLOSE_DRAWER = 0;
const EDIT_DRAWER = 1;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
const columnHelper = createColumnHelper<OrganizationsTypeWithAction>();

const OrganizationsListTable = ({ tableData }: { tableData?: OrganizationsType[] }) => {
  // States
  const [addUserOpen, setAddUserOpen] = useState<-1 | 0 | 1>(CLOSE_DRAWER);
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState(...[tableData]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingRow, setEditingRow] = useState<OrganizationsType | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const router = useRouter();
  const columns = useMemo<ColumnDef<OrganizationsTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1}
          </Typography>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.name}
          </Typography>
        ),
      }),
     
      columnHelper.accessor("prefix", {
        header: "Prefix",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.prefix}
          </Typography>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => <Switch checked={row.original.status} disabled />,
      }),
      columnHelper.accessor("id", {
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <IconButton
                onClick={() =>
                  router.push(`/settings/content-block/edit/${row.original.id}`)
                }
              
              >
                <i className="tabler-edit text-[22px] text-textSecondary" />
              </IconButton>
              <IconButton onClick={() => setIsDeleting(true)}>
                <i className="tabler-trash text-[22px] text-textSecondary" />
              </IconButton>
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const table = useReactTable({
    data: data as OrganizationsType[],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    state: {
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });
  if (addUserOpen === CLOSE_DRAWER)
    return (
      <>
        <Card>
          <div className="flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4">
            <Typography variant="h5">Organizations</Typography>
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
              <Button
                variant="contained"
                startIcon={<i className="tabler-plus" />}
                // onClick={() => setAddUserOpen(ADD_DRAWER)}
                onClick={() => router.push("/settings/organizations/add")}
                className="is-full sm:is-auto"
              >
                Add Organization
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto h-[325px]">
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
                                "flex items-center":
                                  header.column.getIsSorted(),
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
                                asc: (
                                  <i className="tabler-chevron-up text-xl" />
                                ),
                                desc: (
                                  <i className="tabler-chevron-down text-xl" />
                                ),
                              }[
                                header.column.getIsSorted() as "asc" | "desc"
                              ] ?? null}
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
            count={table.getFilteredRowModel().rows.length}
            rowsPerPage={table.getState().pagination.pageSize}
            page={table.getState().pagination.pageIndex}
            onPageChange={(_, page) => {
              table.setPageIndex(page);
            }}
          />
        </Card>
        {/* <AddUserDrawer
          open={addUserOpen}
          editingRow={editingRow}
          setEditingRow={setEditingRow}
          handleClose={() => setAddUserOpen(CLOSE_DRAWER)}
        /> */}
        <ConfirmationDialog
          open={isDeleting}
          type="delete-account"
          setOpen={() => setIsDeleting(false)}
        />
      </>
    );
  if (addUserOpen === EDIT_DRAWER || addUserOpen === ADD_DRAWER)
    return (
      <Card>
        <div className="flex justify-between flex-col items-start md:flex-row md:items-center p-6 border-bs gap-4">
          <Typography variant="h5">
            {addUserOpen === -1 ? "Add" : "Edit"} Content Block
          </Typography>
          <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
            <IconButton onClick={() => setAddUserOpen(0)}>
              <i className="tabler-x text-[22px] text-textSecondary" />
            </IconButton>
          </div>
        </div>
        <Divider />
      </Card>
    );
};

export default OrganizationsListTable;
