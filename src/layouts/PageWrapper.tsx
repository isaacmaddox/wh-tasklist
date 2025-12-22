import { useSettings } from "@/lib/hooks/useSettings";
import { cn } from "@/lib/utils";

export function PageWrapper({ children, className, ...props }: React.ComponentProps<"div">) {
  const { settings } = useSettings();

  return (
    <div
      className={cn(
        "grid gap-3 w-200 max-w-full min-h-full content-start",
        settings.appearance?.width === "wide" && "w-300",
        settings.appearance?.width === "full" && "w-full",
        className
      )}
      {...props}>
      {children}
    </div>
  );
}
