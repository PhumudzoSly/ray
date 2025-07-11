import { makeUseQueryWithStatus } from "convex-helpers/react";
import { useQueries } from "convex/react";

// Do this once somewhere, name it whatever you want.
export const useData = makeUseQueryWithStatus(useQueries);
