import { listApiKeys } from "@/actions/account/user";
import ApiKeysClient from "./api-keys-client";

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  permissions: string[];
  createdBy: string;
  createdAt: number;
  lastUsed?: number;
  isActive: boolean;
  expiresAt?: number;
}

export default async function ApiKeysPage() {
  let initialKeys: ApiKey[] = [];
  let initialError: string | undefined;

  try {
    const result = await listApiKeys();
    if (result.success) {
      initialKeys = result?.apiKeys || [];
    } else {
      initialError = result.error;
    }
  } catch (error) {
    initialError = "Failed to load API keys";
  }

  return <ApiKeysClient initialKeys={initialKeys} initialError={initialError} />;
}
