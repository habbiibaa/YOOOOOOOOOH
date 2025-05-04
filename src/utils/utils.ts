import { redirect } from "next/navigation";

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success' | 'warning')} status - The type of message, either 'error', 'success', or 'warning'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
  status: "success" | "error" | "warning",
  path: string,
  message?: string
) {
  const searchParams = new URLSearchParams();
  searchParams.set("status", status);
  
  if (message) {
    searchParams.set("message", message);
  }
  
  const url = `${path}?${searchParams.toString()}`;
  return redirect(url);
}
