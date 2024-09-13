// React Imports
import { useEffect, useState, useMemo } from "react"
// MUI Imports
import Card from "@mui/material/Card"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import TablePagination from "@mui/material/TablePagination"
import type { TextFieldProps } from "@mui/material/TextField"
// Third-party Imports
import classnames from "classnames"
import { rankItem } from "@tanstack/match-sorter-utils"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,

  getPaginationRowModel,
  getSortedRowModel
} from "@tanstack/react-table"
import type { ColumnDef, FilterFn } from "@tanstack/react-table"
import type { RankingInfo } from "@tanstack/match-sorter-utils"
// Component Imports
import CustomTextField from "@core/components/mui/TextField"
// Style Imports
import tableStyles from "@core/styles/table.module.css"
import ConfirmationDialog from "./ConfirmationDialog"
import { useRouter } from "next/navigation"
import BreadCrumbList from "@components/BreadCrumbList"
// Type Imports
import { RolesType } from "@/types/apps/rolesType"
import RoleCards from "./RolesCard"
import { Chip, MenuItem, Tooltip } from "@mui/material"
import RoleDialog from "./RoleDialog"
import { post } from "@/services/apiService"
import { getRoleList } from "@/services/endpoint/users/roles"
import LoadingBackdrop from "@/components/LoadingBackdrop"

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
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the itemRank info
  addMeta({
    itemRank
  })

  // Return if the item should be filtered in/out
  return itemRank.passed
}

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
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value)
    }, debounce)

    return () => clearTimeout(timeout)
  }, [value])

  return (
    <CustomTextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

// Column Definitions
const columnHelper = createColumnHelper<RolesTypeWithAction>()

const RolesListTable = ({
  totalCount,
  tableData,
  getList,
  initialBody
}: {
  totalCount: number;
  tableData?: RolesType[];
  getList: (arg1: {
    page: number;
    limit: number;
    search: string;
    organizationId: string | number;
    active: boolean | null;
  }) => void;
  initialBody: {
    page: number;
    limit: number;
    search: string;
    organizationId: number | string;
  };
}) => {
  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalRows, setTotalRows] = useState<number>(0)

  // States
  const [globalFilter, setGlobalFilter] = useState("")
  const [deletingId, setDeletingId] = useState<number>(0)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [editId, setEditId] = useState<number>(0)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  let orgId = null

  const getData = async () => {
    setLoading(true)
    try {
      const result = await post(getRoleList, {
        page: page + 1,
        limit: pageSize,
        search: globalFilter,
        active: activeFilter
      })
      setData(result.data.roles)
      setTotalRows(result.data.totalRoles)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getData()
    function handleStorageUpdate() {
      getData()
    }
    window.addEventListener('localStorageUpdate', handleStorageUpdate)

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate)
    }
  }, [page, pageSize, globalFilter, activeFilter])

  const columns = useMemo<ColumnDef<RolesTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1}
          </Typography>
        )
      }),
      columnHelper.accessor("roleName", {
        header: "Role Name",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.roleName}
          </Typography>
        )
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.createdAt}
          </Typography>
        )
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
        )
      }),
      columnHelper.accessor("roleId", {
        header: "Action",
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              <Tooltip title={'Edit'}>
                <IconButton
                  onClick={() => {
                    setEditId(row.original.roleId)
                    setOpenDialog(true)
                  }}
                >
                  <i className="tabler-edit text-[22px] text-textSecondary" />
                </IconButton>
              </Tooltip>
              <Tooltip title={'Delete'}>
                <IconButton
                  onClick={() => {
                    setIsDeleting(true)
                    setDeletingId(row.original.roleId)
                  }}
                >
                  <i className="tabler-trash text-[22px] text-textSecondary" />
                </IconButton>
              </Tooltip>
            </div>
          )
        },
        enableSorting: false
      })
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: {
      rowSelection,
      globalFilter,
      pagination: { pageIndex: page, pageSize }
    },
    globalFilterFn: fuzzyFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalRows / pageSize)
  })

  const handlePageChange = (event: unknown, newPage: number) => {
    if (newPage !== page) {
      setPage(newPage)
    }
  }

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPageSize(parseInt(event.target.value, 10))
    setPage(0)
  }

  useEffect(() => {
    if (deletingId === 0 || !openDialog) {
      getData()
    }
    if (localStorage !== undefined) orgId = localStorage.getItem("selectedOrgId")
  }, [deletingId, openDialog])

  return (
    <>
    <LoadingBackdrop isLoading={loading} />
      <div className="flex justify-between flex-col items-start md:flex-row md:items-center py-2 gap-4">
        <BreadCrumbList />
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
                activeFilter === null ? "all" : activeFilter === true ? "active" : "inactive"
              }
              onChange={(e) => {
                const value = e.target.value
                setActiveFilter(
                  value === "active" ? true : value === "inactive" ? false : null
                )
              }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </CustomTextField>
          </div>
          <RoleCards openDialog={openDialog} setOpenDialog={setOpenDialog} />
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
                                header.column.getCanSort()
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
                              )
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
                          selected: row.getIsSelected()
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
                    )
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
        setDeletingId={setDeletingId}
        setOpen={(arg1: boolean) => setIsDeleting(arg1)}
        deletePayload={{
          roleId: deletingId,
          organizationId: orgId
        }}
      />

      <RoleDialog
        open={openDialog}
        setOpen={setOpenDialog}
        title={"Edit"}
        editId={editId}
      />
    </>
  )
}

export default RolesListTable
