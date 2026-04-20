import { LoaderIcon } from "lucide-react";
import { cn } from "../../utils";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref, ...remainingProps } = props as any;
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...remainingProps}
    />
  );
}

export function SpinnerCustom() {
  return (
    <div className="flex items-center gap-4">
      <Spinner />
    </div>
  );
}
