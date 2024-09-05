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
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { RankingInfo } from "@tanstack/match-sorter-utils";
// Type Imports
import type { UsersType } from "@/types/apps/userTypes";
// Component Imports
import CustomTextField from "@core/components/mui/TextField";
// Style Imports
import tableStyles from "@core/styles/table.module.css";
import ConfirmationDialog from "./ConfirmationDialog";
import { useRouter } from "next/navigation";
import BreadCrumbList from "@/components/BreadCrumbList";
import {
  getSectionList,
  redirectToAddPage,
  redirectToEditPage,
} from "@/services/endpoint/content-block";
import { MenuItem, Tooltip } from "@mui/material";
import CustomChip from "@/@core/components/mui/Chip";
import { post } from "@/services/apiService";
import LoadingBackdrop from "@/components/LoadingBackdrop";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type UsersTypeWithAction = UsersType & {
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
const columnHelper = createColumnHelper<UsersTypeWithAction>();

const UserListTable = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);

  const router = useRouter();
  // States
  const [globalFilter, setGlobalFilter] = useState("");
  const [deletingId, setDeletingId] = useState<number>(-1);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);

  const getData = async () => {
    setLoading(true);
    try {
      const result = await post(getSectionList, {
        page: page + 1,
        limit: pageSize,
        search: globalFilter,
        active: activeFilter,
      });
      setData(
        result.data.sections?.map((item: any) => ({
          id: item.sectionId,
          name: item.sectionName,
          slug: item.sectionSlug,
          jsonContent: item.sectionTemplate,
          createdAt: item.createdAt,
          status: item.active,
        }))
      );
      setTotalRows(result.data.totalSections);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getData();
  }, [page, pageSize, globalFilter, activeFilter]);

  const columns = useMemo<ColumnDef<UsersTypeWithAction, any>[]>(
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
        header: "Content Block",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.name}
          </Typography>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.createdAt}
          </Typography>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) => (
          <CustomChip
            size="small"
            round="true"
            label={row.original.status ? "Active" : "Inactive"}
            variant="tonal"
            color={row.original.status ? "success" : "error"}
          />
        ),
      }),
      columnHelper.accessor("id", {
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <Tooltip title={"Edit"}>
                <IconButton
                  onClick={() => {
                    router.push(redirectToEditPage(row.original.id));
                  }}
                >
                  <i className="tabler-edit text-[22px] text-textSecondary" />
                </IconButton>
              </Tooltip>
              <Tooltip title={"Delete"}>
                <IconButton
                  onClick={() => {
                    setIsDeleting(true);
                    setDeletingId(row.original.id);
                  }}
                >
                  <i className="tabler-trash text-[22px] text-textSecondary" />
                </IconButton>
              </Tooltip>
            </div>
          );
        },
        enableSorting: false,
      }),
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      rowSelection,
      globalFilter,
      pagination: { pageIndex: page, pageSize },
    },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pageSize),
  });

  const handlePageChange = (event: unknown, newPage: number) => {
    if (newPage !== page) {
      setPage(newPage);
    }
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if (deletingId === 0) {
      getData();
    }
  }, [deletingId]);

  return (
    <>
      <LoadingBackdrop isLoading={loading} />
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center py-2 gap-4">
        <BreadCrumbList />
        {/* <div className="flex justify-between flex-col items-start md:flex-row md:items-center py-2 gap-4"> */}
        {/* <BreadCrumbList /> */}
        <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
          <DebouncedInput
            value={globalFilter ?? ""}
            onChange={(value) => setGlobalFilter(String(value))}
            placeholder="Search"
            className="is-full sm:is-auto"
          />
          <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
            <Typography>Status:</Typography>
            <CustomTextField
              select
              fullWidth
              defaultValue="all"
              id="custom-select"
              value={
                activeFilter === null
                  ? "all"
                  : activeFilter === true
                    ? "active"
                    : "inactive"
              }
              onChange={(e) => {
                const value = e.target.value;
                setActiveFilter(
                  value === "active"
                    ? true
                    : value === "inactive"
                      ? false
                      : null
                );
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </CustomTextField>
          </div>
          <Button
            variant="contained"
            startIcon={<i className="tabler-plus" />}
            onClick={() => router.push(redirectToAddPage)}
            className="is-full sm:is-auto"
          >
            Add Content Block
          </Button>
        </div>
      </div>

      {/* <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
        <DebouncedInput
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search"
          className="is-full sm:is-auto"
        />
        <Button
          variant="contained"
          startIcon={<i className="tabler-plus" />}
          onClick={() => router.push(redirectToAddPage)}
          className="is-full sm:is-auto"
        >
          Add Content Block
        </Button>
        
      </div> */}
      <Card>
        <div className="overflow-x-auto">
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
          component="div"
          count={totalRows}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>
      <ConfirmationDialog
        open={isDeleting}
        deletingId={deletingId}
        setDeletingId={setDeletingId}
        setOpen={(arg1: boolean) => setIsDeleting(arg1)}
      />
    </>
  );
};

export default UserListTable;
