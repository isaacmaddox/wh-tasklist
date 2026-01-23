import { Spinner } from "@/components/ui/spinner";

export function LoadingPage() {
   return (
      <div className="fixed inset-0 bg-background backdrop-blur-xl grid place-content-center">
         <span className="flex items-center gap-4 animate-pulse">
            <Spinner className="size-6 text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
         </span>
      </div>
   );
}
