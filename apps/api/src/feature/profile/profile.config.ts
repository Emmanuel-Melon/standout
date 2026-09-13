import type { JsonApiResourceConfig } from "@/lib/express/express.types";

import type {
  Highlight,
  Profile,
  ProfileWithHighlights,
} from "./profile.types";

export const SerializedProfile: JsonApiResourceConfig<Profile> = {
  type: "profile",
  attributes: (profile: Profile) => profile,
};

export const SerializedHighlight: JsonApiResourceConfig<Highlight> = {
  type: "highlight",
  attributes: (highlight: Highlight) => highlight,
};

export const SerializedProfileWithHighlights: JsonApiResourceConfig<ProfileWithHighlights> =
  {
    type: "profile_with_highlights",
    attributes: (profile: ProfileWithHighlights) => profile,
  };
