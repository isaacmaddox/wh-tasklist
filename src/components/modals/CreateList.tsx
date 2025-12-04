import { auth, db } from "@/lib/firebase";
import { generateSalt, hashPassword, toBase64 } from "@/lib/hashing";
import { cn } from "@/lib/utils";
import { ref, set } from "firebase/database";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useActionState, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "../ui/input-group";
import { Switch } from "../ui/switch";

interface CreateListModalProps extends React.ComponentProps<typeof Dialog> {
  children: React.ReactElement<typeof Button>;
}

export function CreateListModal({ children }: CreateListModalProps) {
  const [, formAction, isFormPending] = useActionState(doSubmit, null);
  const [user] = useAuthState(auth);
  const [passwordProtected, setPasswordProtected] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const navigate = useNavigate();
  if (!user) return;

  async function doSubmit(_: unknown, formData: FormData) {
    const name = formData.get("name");
    const password_protected = !!formData.get("password_protected");
    const password = formData.get("password");

    if (!name) {
      return {
        success: false,
        error: "Please enter a valid name",
      };
    }

    let stored_hash: string | undefined = undefined;
    let stored_salt: string | undefined = undefined;

    if (password_protected) {
      if (!password) toast.error("Please enter a password");

      const salt = generateSalt();
      const { hash } = await hashPassword(String(password), salt);

      stored_hash = toBase64(hash);
      stored_salt = toBase64(salt);
    }

    const id = crypto.randomUUID();
    const newListRef = ref(db, `lists/${id}`);
    await set(newListRef, {
      id,
      owner_id: user!.uid,
      name,
      password_protected,
      ...(stored_hash && { hash: stored_hash }),
      ...(stored_salt && { salt: stored_salt }),
    });

    navigate(`/l/${id}`);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New List</DialogTitle>
          <DialogDescription>Make a new list</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="grid grid-rows-subgrid row-span-2">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">List name</FieldLabel>
              <Input id="name" name="name" type="text" required />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="password_protected">Enable password protection</FieldLabel>
                <FieldDescription>You will be able to specify a password that those wishing to view your list must enter.</FieldDescription>
              </FieldContent>
              <Switch onCheckedChange={(checked) => setPasswordProtected(checked)} id="password_protected" name="password_protected" />
            </Field>
            <Field className={cn("transition-opacity", !passwordProtected && "opacity-50")}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={passwordProtected}
                  disabled={!passwordProtected}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isFormPending}>
              {isFormPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * <form action={formAction} className="w-100 max-w-full mx-auto">
      <FieldGroup>
        <FieldSet>
          <FieldLegend className="text-xl!">Create a new list</FieldLegend>
          <FieldDescription>Create a new list to start work!</FieldDescription>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">List name</FieldLabel>
              <Input id="name" name="name" type="text" required />
            </Field>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="password_protected">Enable password protection</FieldLabel>
                <FieldDescription>You will be able to specify a password that those wishing to view your list must enter.</FieldDescription>
              </FieldContent>
              <Switch onCheckedChange={(checked) => setPasswordProtected(checked)} id="password_protected" name="password_protected" />
            </Field>
            <Field className={cn("transition-opacity", !passwordProtected && "opacity-50")}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required={passwordProtected}
                  disabled={!passwordProtected}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton size="icon-xs" onClick={() => setShowPassword((s) => !s)}>
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          </FieldGroup>
        </FieldSet>
        <Field orientation="horizontal">
          <Button type="submit" className="w-full" disabled={isFormPending}>
            {isFormPending ? "Creating..." : "Create"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
 */
