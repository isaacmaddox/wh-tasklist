import { ListPageContext } from "@/components/providers/list/context";
import { Field, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { useContext } from "react";

export function ListFilters() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { filters, dispatchFilters } = ctx;

   return (
      <li className="grid grid-cols-2 gap-4 col-span-full items-center">
         <Field className="max-md:col-span-full">
            <FieldLabel htmlFor="search">Filter</FieldLabel>
            <InputGroup>
               <InputGroupInput
                  id="filter"
                  type="text"
                  placeholder="Search..."
                  value={filters?.search}
                  onChange={(e) => dispatchFilters({ search: e.currentTarget.value })}
               />
            </InputGroup>
         </Field>
      </li>
   );
}
