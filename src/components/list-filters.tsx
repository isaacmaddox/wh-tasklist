import { ListPageContext } from "@/components/providers/list/context";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuCheckboxItem,
   DropdownMenuContent,
   DropdownMenuGroup,
   DropdownMenuLabel,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { getLocalDateFromInput } from "@/lib/utils";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { useContext } from "react";

export function ListFilters() {
   const ctx = useContext(ListPageContext);
   if (!ctx) throw new Error("Not in context");
   const { filters, dispatchFilters } = ctx;
   const [search, setSearch] = useDebounce(filters.search, (value) => {
      dispatchFilters({ search: value });
   });

   return (
      <li className="search-row grid grid-cols-2 gap-4 mt-1 col-span-full items-center">
         <Field className="max-md:col-span-full">
            <FieldLabel className="leading-none" htmlFor="search">
               Filter
            </FieldLabel>
            <InputGroup>
               <InputGroupInput
                  id="search"
                  name="search"
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={setSearch}
               />
               <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" variant="ghost" onClick={() => dispatchFilters({ search: "" })}>
                     <XIcon />
                     <span className="sr-only">Clear search</span>
                  </InputGroupButton>
               </InputGroupAddon>
            </InputGroup>
         </Field>
         <div className="grid grid-cols-2 items-end max-md:col-span-full">
            <Field>
               <FieldLabel className="leading-none" htmlFor="startDate">
                  From
               </FieldLabel>
               <Input
                  type="date"
                  className="dark:scheme-dark rounded-tr-none rounded-br-none"
                  id="startDate"
                  onChange={(e) => {
                     dispatchFilters({ startDate: getLocalDateFromInput(e.currentTarget.value) });
                  }}
               />
            </Field>
            <Field>
               <FieldLabel className="leading-none" htmlFor="endDate">
                  To
               </FieldLabel>
               <Input
                  type="date"
                  className="dark:scheme-dark rounded-tl-none rounded-bl-none"
                  id="endDate"
                  onChange={(e) => {
                     dispatchFilters({ endDate: getLocalDateFromInput(e.currentTarget.value) });
                  }}
               />
            </Field>
         </div>
         <div className="col-span-2 grid grid-cols-[1fr_min-content] items-center">
            <Field className="w-fit justify-self-end">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="w-fit">
                        <SlidersHorizontalIcon />
                        Advanced
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                     <DropdownMenuGroup>
                        <DropdownMenuLabel>Status</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                           checked={filters.showIncomplete}
                           onCheckedChange={() => dispatchFilters({ showIncomplete: !filters.showIncomplete })}
                           onSelect={(e) => e.preventDefault()}>
                           Incomplete
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                           checked={filters.showComplete}
                           onCheckedChange={() => dispatchFilters({ showComplete: !filters.showComplete })}
                           onSelect={(e) => e.preventDefault()}>
                           Completed
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                           checked={filters.showFlagged}
                           onCheckedChange={() => dispatchFilters({ showFlagged: !filters.showFlagged })}
                           onSelect={(e) => e.preventDefault()}>
                           Flagged
                        </DropdownMenuCheckboxItem>
                     </DropdownMenuGroup>
                     <DropdownMenuGroup>
                        <DropdownMenuLabel>Due Date</DropdownMenuLabel>
                        <DropdownMenuCheckboxItem
                           checked={filters.showOverdue}
                           onCheckedChange={() => dispatchFilters({ showOverdue: !filters.showOverdue })}
                           onSelect={(e) => e.preventDefault()}>
                           Overdue
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                           checked={filters.showDueSoon}
                           onCheckedChange={() => dispatchFilters({ showDueSoon: !filters.showDueSoon })}
                           onSelect={(e) => e.preventDefault()}>
                           Due Soon
                        </DropdownMenuCheckboxItem>
                     </DropdownMenuGroup>
                  </DropdownMenuContent>
               </DropdownMenu>
            </Field>
            <Button
               variant="ghost-dim"
               className="ml-2"
               onClick={() => {
                  dispatchFilters(null);
               }}>
               Clear all
            </Button>
         </div>
      </li>
   );
}
