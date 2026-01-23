import { Button } from "@/components/ui/button";
import {
   Field,
   FieldDescription,
   FieldError,
   FieldGroup,
   FieldLabel,
   FieldLegend,
   FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { AuthService } from "@/lib/services/auth-service";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { Link } from "react-router-dom";

export function RegisterPage() {
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
   const [formState, formAction, isFormPending] = useActionState(doRegister, null);

   async function doRegister(_: unknown, data: FormData) {
      const email = data.get("email") as string;
      const password = data.get("password") as string;
      const confirmPassword = data.get("confirmPassword") as string;

      const service = AuthService.getInstance();

      const { errors } = await service.register({ email, password, confirmPassword });

      if (errors) {
         return { errors };
      }

      return null;
   }

   return (
      <form action={formAction} className="w-100 max-w-full mx-auto">
         <FieldGroup>
            <FieldSet>
               <FieldLegend className="text-xl!">Register</FieldLegend>
               <FieldDescription>Register to get started</FieldDescription>
               <FieldGroup>
                  <Field data-invalid={!!formState?.errors?.email}>
                     <FieldLabel htmlFor="email">Email address</FieldLabel>
                     <Input
                        autoFocus
                        id="email"
                        name="email"
                        type="email"
                        required
                        aria-invalid={!!formState?.errors?.email}
                     />
                     {formState?.errors?.email && <FieldError>{formState.errors.email}</FieldError>}
                  </Field>
                  <Field data-invalid={!!formState?.errors?.password}>
                     <FieldLabel htmlFor="password">Password</FieldLabel>
                     <InputGroup>
                        <InputGroupInput
                           autoFocus
                           id="password"
                           name="password"
                           type={showPassword ? "text" : "password"}
                           required
                           aria-invalid={!!formState?.errors?.password}
                        />
                        <InputGroupAddon align="inline-end">
                           <InputGroupButton size="icon-xs" onClick={() => setShowPassword(!showPassword)}>
                              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                           </InputGroupButton>
                        </InputGroupAddon>
                     </InputGroup>
                     {formState?.errors?.password && <FieldError>{formState.errors.password}</FieldError>}
                  </Field>
                  <Field data-invalid={!!formState?.errors?.confirmPassword}>
                     <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                     <InputGroup>
                        <InputGroupInput
                           autoFocus
                           id="confirmPassword"
                           name="confirmPassword"
                           type={showConfirmPassword ? "text" : "password"}
                           required
                           aria-invalid={!!formState?.errors?.confirmPassword}
                        />
                        <InputGroupAddon align="inline-end">
                           <InputGroupButton
                              size="icon-xs"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                           </InputGroupButton>
                        </InputGroupAddon>
                     </InputGroup>
                     {formState?.errors?.confirmPassword && <FieldError>{formState.errors.confirmPassword}</FieldError>}
                  </Field>
               </FieldGroup>
               {formState?.errors.general && <FieldError>{formState.errors.general}</FieldError>}
            </FieldSet>
            <Field orientation="horizontal">
               <Button type="submit" className="w-full" disabled={isFormPending}>
                  {isFormPending ? "Registering..." : "Register"}
               </Button>
            </Field>
         </FieldGroup>
         <hr className="my-4" />
         <p>
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 dark:text-blue-300 underline underline-offset-2">
               Log in now.
            </Link>
         </p>
      </form>
   );
}
