import * as Sentry from "@sentry/react";

type Nothing = { nothing: never };

export type ServiceReturnType<TShape = Record<string, unknown>, TData extends object = Nothing> =
   | (TData extends Nothing
        ? { success: true; errors?: never; data?: never }
        : { success: true; errors?: never; data: TData })
   | ServiceErrorType<TShape>;

export type ServiceErrorType<TShape = Record<string, unknown>> = {
   success: false;
   data?: never;
   errors?: {
      [Key in keyof TShape]?: string;
   } & {
      general?: string;
   };
};

export interface HandleErrorOptions {
   message?: string;
   severity?: Sentry.SeverityLevel;
   permissionErrorMessage?: string;
}
