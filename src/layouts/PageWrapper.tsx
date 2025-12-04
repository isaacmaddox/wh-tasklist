import { cn } from "@/lib/utils";

export function PageWrapper({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("grid gap-3 w-200 max-w-full min-h-full content-start", className)} {...props}>
      {children}
    </div>
  );
}
