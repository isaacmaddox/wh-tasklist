import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
   const [error, setError] = useState<string>();
   const navigate = useNavigate();

   async function doSubmit(formData: FormData) {
      const name = formData.get("name");

      if (!name) {
         setError("Please enter a list name");
         return;
      }

      const response = await fetch("/api/l", {
         method: "POST",
         body: JSON.stringify({ name }),
         headers: {
            "Content-Type": "application/json",
         },
      });
      const data = await response.json();

      if (data.status === "success") {
         navigate(`/l/${data.data.id}`);
      }
   }

   return (
      <form action={doSubmit}>
         <label htmlFor="name">Name</label>
         <input type="text" name="name" id="name" />
         <button type="submit">Submit</button>
         {error && <p>{error}</p>}
      </form>
   );
}
