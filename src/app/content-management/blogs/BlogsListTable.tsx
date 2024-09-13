"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Card from "@mui/material/Card"
import { MenuItem, TablePagination, TextFieldProps, Tooltip } from "@mui/material"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
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
import CustomTextField from "@core/components/mui/TextField"
import tableStyles from "@core/styles/table.module.css"
// import ConfirmationDialog from "./ConfirmationDialog";
import { post, postDataToOrganizationAPIs } from "@/services/apiService"
import CustomChip from "@/@core/components/mui/Chip"
import { TemplateType } from "@/types/apps/templateType"
import BreadCrumbList from "@/components/BreadCrumbList"
import LoadingBackdrop from "@/components/LoadingBackdrop"
import { truncateText } from "@/utils/common"
import { blogsType } from "@/types/apps/blogsType"
import { blogPost } from "@/services/endpoint/blogpost"
import ConfirmationDialog from "./ConfirmationDialog"
import { authnetication } from "@/services/endpoint/auth"
import { storePermissionData } from "@/utils/storageService"

declare module "@tanstack/table-core" {
  // interface FilterFns {
  //   fuzzy: FilterFn<unknown>;
  // }
  // interface FilterMeta {
  //   itemRank: RankingInfo;
  // }
}

type BlogTypeWithAction = blogsType & {
  action?: string;
};

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
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
  }, [value, onChange, debounce])

  return (
    <CustomTextField
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

const columnHelper = createColumnHelper<BlogTypeWithAction>()

const BlogListTable = () => {
  // const { hasPermission } = usePermission()
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

  const hasCheckModule = (menuKey: string): boolean => !!(userPermissionData && userPermissionData[menuKey])
  const router = useRouter()
  if (!hasCheckModule('Blog')) {
    router.push('/401-not-authorized')
    return null
  }

  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [data, setData] = useState<TemplateType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(10)
  const [totalRows, setTotalRows] = useState<number>(0)
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null)
  const [deletingId, setDeletingId] = useState<number>(0)
  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const getData = async () => {
    setLoading(true)
    try {
      const result = await postDataToOrganizationAPIs(blogPost.list, {
        page: page + 1,
        limit: pageSize,
        search: globalFilter,
        active: activeFilter
      })
      getPermissionModule()
      setData(result.data.blogs)
      setTotalRows(result.data.totalBlogs)
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

  useEffect(() => {
    if (deletingId == -1) {
      getData()
    }
  }, [deletingId])

  const columns = useMemo<ColumnDef<BlogTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1 + page * pageSize}
          </Typography>
        ),
        enableSorting: false
      }),
      columnHelper.accessor("blogTitle", {
        header: "Blog Title",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.original.blogTitle}
          </Typography>
        )
      }),

      columnHelper.accessor("authorName", {
        header: "Author Name",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {truncateText(row.original.authorName, 25)}
          </Typography>
        ),
        enableSorting: false
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
          <div className="flex items-center">
            <CustomChip
              size="small"
              round="true"
              label={row.original.active ? "Publish" : "Draft"}
              variant="tonal"
              color={row.original.active ? "success" : "warning"}
            />
          </div>
        ),
        enableSorting: false
      }),

      columnHelper.accessor("blogId", {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center">
            {userPermissionData && (
              hasPermission('Blog', 'Edit') ? (
                <Tooltip title={'Edit'}>
                  <IconButton
                    onClick={() =>
                      router.push(
                        `/content-management/blogs/edit/${row.original.blogId}` // Edit URL
                      )
                    }
                  >
                    <i className="tabler-edit text-[22px] text-textSecondary" />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title={'View'}>
                  <IconButton
                    onClick={() =>
                      router.push(
                        `/content-management/blogs/view/${row.original.blogId}` // View URL
                      )
                    }
                  >
                    <i className="tabler-eye text-[22px] text-textSecondary" />
                  </IconButton>
                </Tooltip>

              ))}
            {userPermissionData && (
              (hasPermission('Blog', 'Delete')) && (

                <Tooltip title={'Delete'}>
                  <IconButton
                    onClick={() => {
                      setIsDeleting(true)
                      setDeletingId(row.original.blogId)
                    }}
                  >
                    <i className="tabler-trash text-[22px] text-textSecondary" />
                  </IconButton>
                </Tooltip>
              )
            )}
          </div>
        ),
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

  return (
    <>
      <div>

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
                <MenuItem value="active">Publish</MenuItem>
                <MenuItem value="inactive">Draft</MenuItem>
              </CustomTextField>
            </div>
            {hasPermission('Blog', 'Create') && (
              <Button
                variant="contained"
                startIcon={<i className="tabler-plus" />}
                onClick={() => router.push("/content-management/blogs/add")}
                className="is-full sm:is-auto"
              >
                Add Blog
              </Button>
            )}
          </div>
        </div>
        <Card className="flex flex-col h-full">
          <div className="overflow-x-auto h-[470px]">
            <table className={tableStyles.table}>
              <thead className="">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id}>
                        {header.isPlaceholder ? null : (
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
                  {table.getRowModel().rows.map((row) => (
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
      </div>
    </>
  )
}

export default BlogListTable
