import { Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const BreadCrumbList = () => {
  const router = useRouter();
  const pathSplits: string[] = usePathname().substring(1).split("/");

  const breadCrumbClick = (clickedItemIndex: number): void => {
    const pathSegments = pathSplits.slice(0, clickedItemIndex + 1).join("/");
    router.push(`/${pathSegments}`);
  };

  const formatBreadcrumb = (text: string) => {
    return text.replace(/-/g, " ");
  };

  return (
    <div className="h-14 flex items-center">
      {pathSplits.map((item: string, index: number) => (
        <div
          key={index}
          onClick={() => {
            let editIndex = pathSplits.indexOf("edit");
            if (
              index === 0 ||
              (item.toLowerCase() === "edit" &&
                index === pathSplits.length - 2) ||
              (editIndex !== -1 && pathSplits.indexOf("edit") <= index) ||
              !Number.isNaN(parseInt(pathSplits[index]))
            ) {
              return;
            }
            breadCrumbClick(index);
          }}
        >
          <Typography
            variant="h5"
            className={`capitalize cursor-pointer`}
            style={{
              pointerEvents:
                index === 0 ||
                index === pathSplits.length - 1 ||
                (item.toLowerCase() === "edit" &&
                  index === pathSplits.length - 2) ||
                (pathSplits.indexOf("edit") !== -1 &&
                  pathSplits.indexOf("edit") <= index)
                  ? "none"
                  : "auto",
            }}
          >
            &nbsp;{formatBreadcrumb(item)}&nbsp;
            {index === pathSplits.length - 1 ? "" : "/"}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export default BreadCrumbList;
