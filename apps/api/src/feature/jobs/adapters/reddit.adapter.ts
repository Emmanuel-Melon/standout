import type { JobListing, JobSearchAdapter, QueryIntent } from "../jobs.types";

export class RedditJobAdapter implements JobSearchAdapter {
  name = "reddit";

  async search(intent: QueryIntent): Promise<JobListing[]> {
    const skillsQuery = intent.skills.join(" ");

    return [
      {
        id: `rd-1`,
        title: `[Hiring] ${skillsQuery ? `${skillsQuery} Developer` : "Engineer"} wanted`,
        company: "RemoteFirst Corp",
        location: "Remote",
        isRemote: true,
        description: `We are hiring globally. Tech stack includes ${intent.skills.join(", ")}.`,
        url: "https://reddit.com/r/remotedata/comments/mock",
        source: "reddit",
        postedAt: new Date().toISOString(),
      },
    ];
  }
}
