import type { JobListing, JobSearchAdapter, QueryIntent } from "../jobs.types";

export class TwitterJobAdapter implements JobSearchAdapter {
  name = "twitter";

  async search(intent: QueryIntent): Promise<JobListing[]> {
    // Simulated API fetch based on intent roles/skills
    const rolesQuery = intent.roles.join(" ");

    return [
      {
        id: `tw-1`,
        title: `Senior ${rolesQuery || "Software Engineer"}`,
        company: "StartupX",
        location: "Kampala, Uganda / Remote",
        isRemote:
          intent.locationPref === "remote" || intent.locationPref === "any",
        description: `Looking for a developer skilled in ${intent.skills.join(", ")} to join our early-stage team.`,
        url: "https://x.com/mock/status/123456789",
        source: "twitter",
        postedAt: new Date().toISOString(),
      },
    ];
  }
}
