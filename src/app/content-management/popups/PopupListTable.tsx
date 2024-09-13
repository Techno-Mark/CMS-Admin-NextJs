import CustomTextField from "@/@core/components/mui/TextField"
import {
  Button,
  Card,
  IconButton,
  MenuItem,
  TablePagination,
  TextFieldProps,
  Tooltip,
  Typography
} from "@mui/material"
import { rankItem } from "@tanstack/match-sorter-utils"
import {
  ColumnDef,
  FilterFn,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from "@tanstack/react-table"
import classNames from "classnames"
import { useRouter } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"
import ConfirmationDialog from "./ConfirmationDialog"

import tableStyles from "@core/styles/table.module.css"
import { popups, redirectToAddPage, redirectToEditPage } from "@/services/endpoint/popup"
import CustomChip from "@/@core/components/mui/Chip"
import BreadCrumbList from "@/components/BreadCrumbList"
import { post } from "@/services/apiService"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import { authnetication } from "@/services/endpoint/auth"
import { storePermissionData } from "@/utils/storageService"

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({
    itemRank
  })

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
const columnHelper = createColumnHelper<any>()

const PopupListTable = () => {
  const [userIdRole, setUserIdRole] = useState()
  const [userPermissionData, setUserPermissionData] = useState()
  const getPermissionModule = async () => {
    setLoading(true)
    try {
      const result = await post(authnetication.user_permission_data, {})
      console.log(result.data)
      setUserIdRole(result.data.currentUserId)
      setUserPermissionData(result.data.moduleWisePermissions)
      console.log(userIdRole)

      await storePermissionData(result.data)
      setLoading(false)
    } catch (error: any) {
      console.error(error)
      setLoading(false)
    }
  }
  function hasPermission(module: string, action: string) {
    if (userIdRole == 1) {
      return true
    }
    // @ts-ignore
    return userPermissionData?.[module]?.includes(action) ?? false
  }

  const [rowSelection, setRowSelection] = useState({})
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalRows, setTotalRows] = useState<number>(0)

  const router = useRouter()
  // States
  const [globalFilter, setGlobalFilter] = useState("")
  const [deletingId, setDeletingId] = useState<number>(-1)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)

  const getData = async () => {
    setLoading(true)
    try {
      const result = await post(popups.list, {
        page: page + 1,
        limit: pageSize,
        search: globalFilter,
        active: activeFilter
      })
      getPermissionModule()
      setData(
        result.data.popups.map((item: any) => ({
          popupId: item.popupId,
          popupTitle: item.popupTitle,
          createdAt: item.createdAt,
          active: item.active
        }))
      )
      setTotalRows(result.data.totalPopups)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    getData()
    const handleStorageUpdate = async () => {
      getData()
    }

    window.addEventListener("localStorageUpdate", handleStorageUpdate)

    return () => {
      window.removeEventListener("localStorageUpdate", handleStorageUpdate)
    }
  }, [page, pageSize, globalFilter, activeFilter])

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1}
          </Typography>
        )
      }),
      columnHelper.accessor("popupTitle", {
        header: "Popup Title",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.popupTitle}
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
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ row }) =>
          <CustomChip
            size="small"
            round="true"
            label={row.original.active ? 'Active' : 'Inactive'}
            variant="tonal"
            color={row.original.active ? 'success' : 'error'}
          />
      }),
      columnHelper.accessor("id", {
        header: "Actions",
        cell: ({ row }) => {
          return (
            <div className="flex items-center">
              {userPermissionData && (
                hasPermission('Popup', 'Edit') ? (
                  <Tooltip title={'Edit'}>
                    <IconButton
                      onClick={() => {
                        router.push(redirectToEditPage(row.original.popupId))
                      }}
                    >
                      <i className="tabler-edit text-[22px] text-textSecondary" />
                    </IconButton>
                  </Tooltip>
                ) : <Tooltip title={'View'}>
                  <IconButton
                    onClick={() => {
                      router.push(redirectToEditPage(row.original.popupId))
                    }}
                  >
                    <i className="tabler-eye text-[22px] text-textSecondary" />
                  </IconButton>
                </Tooltip>)}
              {userPermissionData && (
                (hasPermission('Popup', 'Delete')) && (
                  <Tooltip title={'Delete'}>
                    <IconButton
                      onClick={() => {
                        setIsDeleting(true)
                        setDeletingId(row.original.popupId)
                      }}
                    >
                      <i className="tabler-trash text-[22px] text-textSecondary" />
                    </IconButton>
                  </Tooltip>
                ))}
            </div>
          )
        },
        enableSorting: false
      })
    ],
    [router, page, pageSize, userPermissionData]
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
    if (deletingId === 0) {
      getData()
    }
  }, [deletingId])

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
              <MenuItem value="inactive">InActive</MenuItem>
            </CustomTextField>
          </div>
          {hasPermission('Popup', 'Create') && (
            <Button
              variant="contained"
              startIcon={<i className="tabler-plus" />}
              onClick={() => router.push(redirectToAddPage)}
              className="is-full sm:is-auto"
            >
              Add Pop-up
            </Button>
          )}
        </div>
      </div>
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
                            className={classNames({
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
                        className={classNames({
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
        deletingId={deletingId}
        setDeletingId={setDeletingId}
        setOpen={(arg1: boolean) => setIsDeleting(arg1)}
      />
    </>
  )
}

export default PopupListTable
