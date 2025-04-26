import { type GetServerSidePropsContext } from "next";
import {
  createBrowserClient,
  createServerClient,
  serializeCookieHeader,
} from "@supabase/ssr";

export const createSupabaseServerClient = ({ req, res }: GetServerSidePropsContext) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return Object.keys(req.cookies).map((name) => ({
            name,
            value: req.cookies[name] || "",
          }));
        },
        setAll(cookies) {
          res.setHeader(
            "Set-Cookie",
            cookies.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );

  return supabase;
};

export function createComponentClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return supabase;
}
