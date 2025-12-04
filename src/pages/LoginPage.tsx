import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { loginWithEmailAndPassword } from "@/lib/auth.firebase";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useState } from "react";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formState, formAction, isFormPending] = useActionState(doLoginWithEmail, null);

  async function doLoginWithEmail(_: unknown, data: FormData) {
    const email = data.get("email") || "";
    const password = data.get("password") || "";

    if (!email || !password) {
      return {
        success: false,
        fieldErrors: {
          ...(!email && { email: "Please enter an email" }),
          ...(!password && { password: "Please enter a password" }),
        },
      };
    }

    try {
      const result = await loginWithEmailAndPassword(String(email), String(password));

      if (result.error) {
        return {
          success: false,
          error: result.error,
        };
      }
    } catch (e) {
      return {
        success: false,
        error: "An error occurred while signing in",
      };
    }

    return {
      success: true,
    };
  }

  return (
    <form action={formAction} className="w-100 max-w-full mx-auto">
      <FieldGroup>
        <FieldSet>
          <FieldLegend className="text-xl!">Log in</FieldLegend>
          <FieldDescription>Log in to use TaskList</FieldDescription>
          <FieldGroup>
            <Field data-invalid={!!formState?.fieldErrors?.email}>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <Input autoFocus id="email" name="email" type="email" required aria-invalid={!!formState?.fieldErrors?.email} />
              {formState?.fieldErrors?.email && <FieldError>{formState.fieldErrors.email}</FieldError>}
            </Field>
            <Field data-invalid={!!formState?.fieldErrors?.password}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  aria-invalid={!!formState?.fieldErrors?.password}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {formState?.fieldErrors?.email && <FieldError>{formState.fieldErrors.email}</FieldError>}
            </Field>
          </FieldGroup>
          {formState?.error && <FieldError>{formState.error}</FieldError>}
        </FieldSet>
        <Field orientation="horizontal">
          <Button type="submit" className="w-full" disabled={isFormPending}>
            {isFormPending ? "Checking..." : "Check password"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
