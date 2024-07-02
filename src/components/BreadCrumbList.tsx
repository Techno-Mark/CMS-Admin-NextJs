import { Typography } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";

const BreadCrumbList = () => {
  const router = useRouter();
  const pathSplits: string[] = usePathname().substring(1).split("/");

  const breadCrumbClick = (clickedItemIndex: number): void => {
    const pathSegments = pathSplits.slice(0, clickedItemIndex + 1).join("/");
    router.push(`/${pathSegments}`);
  };

  return (
    <div className="h-14 flex items-center">
      {pathSplits.map((item: string, index: number) => (
        <div key={index} onClick={() => breadCrumbClick(index)}>
          <Typography variant="h5" className={`capitalize cursor-pointer`}>
            &nbsp;{item}&nbsp;{index === pathSplits.length - 1 ? "" : "/"}
          </Typography>
        </div>
      ))}
    </div>
  );
};

export default BreadCrumbList;
