import { useEffect, useEffectEvent, useRef, useState, type ChangeEvent } from "react";

export function useDebounce(defaultValue: string = "", callback: (value: string) => unknown) {
   const [value, setValue] = useState<string>(defaultValue);
   const timeoutRef = useRef<number>(undefined);

   function onKeyDown(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      setValue(event.currentTarget.value);
   }

   const cb = useEffectEvent(callback);

   useEffect(() => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => cb(value), 250);
   }, [value]);

   useEffect(() => {
      setValue(defaultValue);
   }, [defaultValue]);

   return [value, onKeyDown] as const;
}
