import { z } from "zod";

import { queryIntentSchema } from "@/feature/intent/intent.types";

export const jobListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  location: z.string(),
  isRemote: z.boolean(),
  description: z.string(),
  url: z.string().url(),
  source: z.enum(["twitter", "reddit", "linkedin", "board"]),
  postedAt: z.string(),
});

export type JobListing = z.infer<typeof jobListingSchema>;
export type QueryIntent = z.infer<typeof queryIntentSchema>;

export interface JobSearchAdapter {
  name: string;
  search(intent: QueryIntent): Promise<JobListing[]>;
}
