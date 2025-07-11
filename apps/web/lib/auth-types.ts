import type { auth } from "./auth";
import { $Infer } from "./authClient";
export type Session = typeof auth.$Infer.Session;
export type ActiveOrganization = typeof $Infer.ActiveOrganization;
export type Invitation = typeof $Infer.Invitation;
