import { ListPageContext } from "@/components/providers/list/context";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { XIcon } from "lucide-react";
import { useContext } from "react";

export function ListFilters() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { filters, dispatchFilters } = ctx;

   return (
      <li className="search-row grid grid-cols-2 gap-4 col-span-full items-center">
         <Field className="max-md:col-span-full">
            <FieldLabel htmlFor="search">Filter</FieldLabel>
            <InputGroup>
               <InputGroupInput
                  id="filter"
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => dispatchFilters({ search: e.currentTarget.value })}
               />
               <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" variant="ghost" onClick={() => dispatchFilters({ search: "" })}>
                     <XIcon />
                     <span className="sr-only">Clear search</span>
                  </InputGroupButton>
               </InputGroupAddon>
            </InputGroup>
         </Field>
      </li>
   );
}
