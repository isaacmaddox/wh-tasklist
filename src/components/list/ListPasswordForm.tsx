import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { fromBase64, hashPassword, toBase64 } from "@/lib/hashing";
import type { List } from "@/types";
import { ArrowLeftIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface ListPasswordFormProps {
  setIsAccessible: React.Dispatch<React.SetStateAction<boolean>>;
  list: List;
}

export function ListPasswordForm({ setIsAccessible, list }: ListPasswordFormProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formState, formAction, isFormPending] = useActionState(doSubmit, null);

  async function doSubmit(_: unknown, data: FormData) {
    const password = data.get("password") || "";
    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    const storedSalt = fromBase64(list.salt);
    const { hash } = await hashPassword(String(password), storedSalt);

    if (toBase64(hash) === list.hash) {
      setIsAccessible(true);
      return {
        success: true,
      };
    } else {
      return {
        success: false,
        error: "Invalid password",
      };
    }
  }

  return (
    <form action={formAction} className="w-100 max-w-full mx-auto">
      <Button type="button" variant="ghost-dim" className="w-fit mb-4 not-hover:px-0" size="sm" asChild>
        <Link to="/">
          <ArrowLeftIcon />
          Back
        </Link>
      </Button>
      <FieldGroup>
        <FieldSet>
          <FieldLegend className="text-xl!">Enter Password</FieldLegend>
          <FieldDescription>
            Enter the password for <strong className="text-foreground">{list.name}</strong> to view it.
          </FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput autoFocus id="password" name="password" type={showPassword ? "text" : "password"} required />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              {formState?.error && <FieldError>{formState.error}</FieldError>}
            </Field>
          </FieldGroup>
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
