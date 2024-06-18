"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import { Divider, FormControl, InputLabel, MenuItem, Select, Switch, TablePagination, TextFieldProps, Tooltip } from "@mui/material";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import classnames from "classnames";
import { RankingInfo, rankItem } from "@tanstack/match-sorter-utils";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { OrganizationsType } from "@/types/apps/organizationsType";
import TablePaginationComponent from "@components/TablePaginationComponent";
import CustomTextField from "@core/components/mui/TextField";
import tableStyles from "@core/styles/table.module.css";
import ConfirmationDialog from "./ConfirmationDialog";
import { post } from "@/services/apiService";
import { toast } from "react-toastify";

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

const ADD_DRAWER = -1;
const CLOSE_DRAWER = 0;
const EDIT_DRAWER = 1;

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta({ itemRank });
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
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);
    return () => clearTimeout(timeout);
  }, [value, onChange, debounce]);

  return (
    <CustomTextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
};

const columnHelper = createColumnHelper<OrganizationsTypeWithAction>();

const OrganizationsListTable = () => {
  const [addUserOpen, setAddUserOpen] = useState<-1 | 0 | 1>(CLOSE_DRAWER);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [editingRow, setEditingRow] = useState<OrganizationsType | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const router = useRouter();

  const [data, setData] = useState<OrganizationsType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const result = await post('organization/list', {
          page: page + 1,
          limit: pageSize,
          search: globalFilter,
          active: activeFilter,
        });
        setData(result.data.organizations);
        setTotalRows(result.data.totalOrganizations);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [page, pageSize, globalFilter, activeFilter]);

  const columns = useMemo<ColumnDef<OrganizationsTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1 + page * pageSize}
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
      // columnHelper.accessor("status", {
      //   header: "Status",
      //   cell: ({ row }) => <Switch checked={row.original.active} disabled />,
      // }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <Typography
            color="text.primary"
            style={{
              color: row.original.active ? 'green' : 'red',  // Set text color based on active status
              // backgroundColor: row.original.active ? 'lightgreen' : 'lightcoral',  // Set background color based on active status
              padding: '4px 8px',
              borderRadius: '4px',
            }}
          >
            {row.original.active ? 'Active' : 'Inactive'}
          </Typography>
        ),
      }),

      columnHelper.accessor("id", {
        header: "Action",
        cell: ({ row }) => (
          <div className="flex items-center">
            <IconButton
              onClick={() =>
                router.push(`/settings/organizations/edit/${row.original.id}`)
              }
            >
              <i className="tabler-edit text-[22px] text-textSecondary" />
            </IconButton>
            <IconButton onClick={() => setIsDeleting(true)}>
              <i className="tabler-trash text-[22px] text-textSecondary" />
            </IconButton>
          </div>
        ),
        enableSorting: false,
      }),
    ],
    [router, page, pageSize]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { rowSelection, globalFilter, pagination: { pageIndex: page, pageSize } },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handlePageChange = (event: unknown, newPage: number) => {
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

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
            <div className="flex items-center gap-4">
              <Typography>Filter by Status:</Typography>
              <Switch
                checked={activeFilter === true}
                onChange={(e) => setActiveFilter(e.target.checked ? true : null)}
                name="active"
                color="primary"
              />
              <Typography>Active</Typography>
              <Switch
                checked={activeFilter === false}
                onChange={(e) => setActiveFilter(e.target.checked ? false : null)}
                name="inactive"
                color="secondary"
              />
              <Typography>Inactive</Typography>
            </div>
            {/* <div className="flex items-center gap-4">
              <Typography>Filter by Status:</Typography>
              <FormControl variant="outlined" style={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={activeFilter || null}
                  onChange={(e) => console.log(e.target.value );
                  }
                  label="Status"
                >
                  <MenuItem value={null}>
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value={true}>Active</MenuItem>
                  <MenuItem value={false}>Inactive</MenuItem>
                </Select>
              </FormControl>
            </div> */}


            <Button
              variant="contained"
              startIcon={<i className="tabler-plus" />}
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
                            desc: <i className="tabler-chevron-down text-xl" />,
                          }[
                            header.column.getIsSorted() as "asc" | "desc"
                          ] ?? null}
                        </div>
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
                  .rows.map((row) => (
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
                  ))}
              </tbody>
            )}
          </table>
        </div>
        <TablePagination
          component="div"
          count={totalRows}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setPageSize(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />

        <TablePagination
          component={() => (
            <TablePaginationComponent table={table} />
          )}
          count={table.getFilteredRowModel().rows.length}
          rowsPerPage={table.getState().pagination.pageSize}
          page={table.getState().pagination.pageIndex}
          onPageChange={(_, page) => {
            table.setPageIndex(page);
          }}
        />

      </Card>
      <ConfirmationDialog
        open={isDeleting}
        type="delete-account"
        setOpen={() => setIsDeleting(false)}
      />
    </>
  );
};

export default OrganizationsListTable;
