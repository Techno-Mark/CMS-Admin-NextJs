"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Card from "@mui/material/Card";
import { Box, MenuItem, TablePagination, TextFieldProps } from "@mui/material";
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
import CustomTextField from "@core/components/mui/TextField";
import tableStyles from "@core/styles/table.module.css";

import { postDataToOrganizationAPIs } from "@/services/apiService";

import { TemplateType } from "@/types/apps/templateType";
import BreadCrumbList from "@/components/BreadCrumbList";
import LoadingBackdrop from "@/components/LoadingBackdrop";

import { media } from "@/services/endpoint/media";
import { filesType } from "@/types/apps/FilesTypes";
import { toast } from "react-toastify";
import ConfirmationDialog from "./ConfirmationDialog";
// import defaultFileIcon from "../../../../public/images/files.png";

declare module "@tanstack/table-core" {
  interface FilterFns {
    fuzzy: FilterFn<unknown>;
  }
  interface FilterMeta {
    itemRank: RankingInfo;
  }
}

type BlogTypeWithAction = filesType & {
  action?: string;
};

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

const columnHelper = createColumnHelper<BlogTypeWithAction>();

const FileListTable = () => {
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const router = useRouter();

  const [data, setData] = useState<TemplateType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalRows, setTotalRows] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [deletingId, setDeletingId] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const result = await postDataToOrganizationAPIs(media.list, {
          page: page + 1,
          limit: pageSize,
          search: globalFilter,
          active: activeFilter,
        });
        setData(result.data.mediaLists);
        setTotalRows(result.data.totalMediaFiles);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [page, pageSize, globalFilter, deletingId, activeFilter]);
  const validImageTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
  const defaultFileIcon = "public/images/files.png";

  
  useEffect(() => {
    const handleStorageUpdate = async () => {
      const storedOrgName = localStorage.getItem('selectedOrgId');
      const getData = async () => {
        setLoading(true);
        try {
          const result = await postDataToOrganizationAPIs(media.list, {
            page: page + 1,
            limit: pageSize,
            search: globalFilter,
            active: activeFilter,
          });
          setData(result.data.blogs);
          setTotalRows(result.data.totalBlogs);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      getData();
    };

    window.addEventListener('localStorageUpdate', handleStorageUpdate);

    return () => {
      window.removeEventListener('localStorageUpdate', handleStorageUpdate);
    };
  }, []);

  const columns = useMemo<ColumnDef<BlogTypeWithAction, any>[]>(
    () => [
      columnHelper.accessor("srNo", {
        header: "Sr. No.",
        cell: ({ row }) => (
          <Typography color="text.primary" className="font-medium">
            {row.index + 1 + page * pageSize}
          </Typography>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor("filePath", {
        header: "File Name",
        cell: ({ row }) => {
          const { filePath, mediaType, fileName } = row.original;
      
          // Construct the full URL for the file
          const fileUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/${filePath}`;
      
          // Determine if the file is an image
          const isImage = validImageTypes.includes(mediaType);
      
          return (
            <Box display="flex" alignItems="center">
              {mediaType === 'image' ? (
                <img
                  src={fileUrl}
                  alt={filePath}
                  width={50} 
                  height={50} 
                  style={{ objectFit: 'contain', borderRadius: '4px' }} 
                />
              ) : (
                <i className="tabler-file text-[20px]" />
              )}
              <Typography color="text.primary" className="font-medium" marginLeft={1}>
                {fileName}
              </Typography>
            </Box>
          );
        },
      }),

      columnHelper.accessor("mediaId", {
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center">
            <IconButton
              onClick={() => {
                // Construct the correct URL
                const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/${row.original.filePath}`;
               
                // Open the URL in a new tab
                window.open(url, '_blank');
              }}
            >
              <i className="tabler-eye text-[22px] " />
            </IconButton>

            <IconButton
              onClick={() => {
                const url = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/${row.original.filePath}`;

                navigator.clipboard.writeText(url)
                  .then(() => {
                
                    toast.success(`URL copied to clipboard!`);
                  })
                  .catch(err => {
                    console.error('Failed to copy URL:', err);
                    toast.error('Failed to copy URL:');
                  });
              }}
            >
              <i className="tabler-copy text-[22px]" />
            </IconButton>
             <IconButton
              onClick={() => {
                setIsDeleting(true);
                //@ts-ignore
                setDeletingId(row.original.mediaId);
              }}
            >
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

  return (
    <>
      <div className="">
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
            {/* <div className="flex flex-col sm:flex-row is-full sm:is-auto items-start sm:items-center gap-4">
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
                <MenuItem value="active">Publish</MenuItem>
                <MenuItem value="inactive">Draft</MenuItem>
              </CustomTextField>
            </div> */}
            <Button
              variant="contained"
              startIcon={<i className="tabler-plus" />}
              onClick={() => router.push("/settings/files/add")}
              className="is-full sm:is-auto"
            >
              Add File
            </Button>
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
  );
};

export default FileListTable;
