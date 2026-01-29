import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@/lib/firebase";
import { EditIcon, HomeIcon } from "lucide-react";
import { useContext, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Link } from "react-router-dom";

export function ListHeader() {
   const [user] = useAuthState(auth);
   const ctx = useContext(ListPageContext);
   const [isEditing, setIsEditing] = useState<boolean>(false);
   if (!ctx) throw new Error("Not in context");
   if (!user) throw new Error("You must be logged in to do this");
   const { list, updateName } = ctx;

   return (
      <header className="grid gap-4 justify-items-start">
         <Button variant="ghost" size="sm" className="not-hover:px-0 not-hover:text-muted-foreground" asChild>
            <Link to="/">
               <HomeIcon />
               Home
            </Link>
         </Button>
         <div className="w-full">
            {!isEditing && (
               <>
                  <h1
                     className="inline text-3xl font-bold leading-snug align-middle w-fit"
                     onClick={() => setIsEditing(true)}>
                     {list.name}
                  </h1>
                  {list.owner_id === user.uid && (
                     <Button
                        className="inline-flex ml-2 align-middle transition-colors"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}>
                        <EditIcon />
                        <span className="sr-only">Edit title</span>
                     </Button>
                  )}
               </>
            )}
            {isEditing && (
               <Textarea
                  className="w-full h-fit min-h-min leading-snug overflow-hidden p-0 bg-transparent! border-none text-3xl! resize-none rounded-sm field-sizing-content focus:border-none focus:ring-offset-8 focus:ring-offset-background font-bold"
                  autoFocus
                  onFocus={(e) => e.currentTarget.select()}
                  defaultValue={list.name}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                     }
                  }}
                  onBlur={(e) => {
                     setIsEditing(false);
                     if (e.currentTarget.value.trim() !== list.name) updateName(e.currentTarget.value);
                  }}
               />
            )}
         </div>
      </header>
   );
}
