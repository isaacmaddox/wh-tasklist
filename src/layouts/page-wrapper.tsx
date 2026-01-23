import { useSettings } from "@/lib/hooks/use-settings";
import { cn } from "@/lib/utils";

export function PageWrapper({ children, className, ...props }: React.ComponentProps<"div">) {
   const { settings } = useSettings();

   return (
      <div
         className={cn(
            "grid gap-3 w-200 max-w-full min-h-full content-start",
            settings.appearance?.width === "wide" && "w-300",
            settings.appearance?.width === "full" && "w-full",
            className,
         )}
         {...props}>
         {import.meta.env.VITE_ENV === "staging" && (
            <div className="p-2 text-center font-bold uppercase bg-yellow-400/10 text-yellow-400 not-dark:text-yellow-800 not-dark:bg-yellow-600/10 rounded-md">
               Staging environment - testing new features
            </div>
         )}
         {children}
      </div>
   );
}
