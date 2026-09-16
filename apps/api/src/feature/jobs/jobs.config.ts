import type { JsonApiResourceConfig } from "@/lib/express/express.types";

import type { JobListing } from "./jobs.types";

export const SerializedJobListing: JsonApiResourceConfig<JobListing> = {
  type: "job-listing",
  attributes: (job: JobListing) => job,
};
