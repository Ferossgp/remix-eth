import {
  json,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "@remix-run/cloudflare";
import { Form, useLoaderData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { createToastHeaders } from "~/utils/toast.server";

const key = "__my-key__";

export async function loader({ context }: LoaderFunctionArgs) {
  const { MY_KV } = context.env;
  const value = await MY_KV.get(key);
  return json({ value });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { MY_KV: myKv } = context.env;

  if (request.method === "POST") {
    const formData = await request.formData();
    const value = formData.get("value") as string;
    await myKv.put(key, value);

    return json(
      { success: true },
      {
        headers: await createToastHeaders({
          description: "Value created!",
          type: "success",
        }, context.env),
      }
    );
  }

  if (request.method === "DELETE") {
    await myKv.delete(key);
    return json(
      { success: true },
      {
        headers: await createToastHeaders({
          description: "Value deleted!",
          type: "success",
        }, context.env),
      }
    );
  }

  throw new Error(`Method not supported: "${request.method}"`);
}

export default function Index() {
  const { value } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>Welcome to Remix</h1>
      {value ? (
        <>
          <p>Value: {value}</p>
          <Form method="DELETE">
            <Button>Delete</Button>
          </Form>
        </>
      ) : (
        <>
          <p>No value</p>
          <Form method="POST">
            <label htmlFor="value">Set value: </label>
            <Input type="text" name="value" id="value" required />
            <br />
            <Button>Save</Button>
          </Form>
        </>
      )}
    </div>
  );
}
