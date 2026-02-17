import { Skeleton } from "../skeleton/skeleton";
import { TableBody, TableCell, TableRow } from "./table";
import { cn } from "../../utils";

interface TableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  columnWidths?: (number | string | undefined)[];
  showCellBorders?: boolean;
  className?: string;
}

export function TableSkeleton({
  columnCount,
  rowCount = 5,
  columnWidths,
  showCellBorders,
  className,
}: TableSkeletonProps) {
  return (
    <TableBody className={className}>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columnCount }).map((_, cellIndex) => {
            const width = columnWidths?.[cellIndex];
            const widthStyle =
              typeof width === "number"
                ? `${width}px`
                : typeof width === "string"
                  ? width
                  : undefined;

            return (
              <TableCell
                key={cellIndex}
                className={cn(
                  "overflow-hidden overflow-ellipsis border-neutral-dark-gray/20",
                  showCellBorders && cellIndex !== 0 ? "border-l" : "",
                  showCellBorders && rowIndex !== rowCount - 1 ? "border-b" : ""
                )}
                style={widthStyle ? { width: widthStyle } : undefined}
              >
                <Skeleton className="h-5 w-full" />
              </TableCell>
            );
          })}
        </TableRow>
      ))}
    </TableBody>
  );
}
