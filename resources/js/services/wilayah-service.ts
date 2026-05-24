import { Wilayah } from "@/types/wilayah"

/**
 * Fetch child region options for a parent code or retrieve root provinces.
 *
 * @param parent Optional parent region code.
 */
export async function fetchWilayahChildren(parent?: string): Promise<Wilayah[]> {
  const url = parent ? `/wilayah/children?parent=${parent}` : "/wilayah/children"
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error(`Failed to fetch wilayah children for parent: ${parent || "root"}`)
  }
  
  return response.json()
}
