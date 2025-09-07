"use server";

import { prisma } from "@workspace/backend";
import { getSession } from "../account/user";

export async function getValidation({ id }: { id: string }) {
  await getSession();
  const validation = await prisma.ideaValidation.findUnique({
    where: {
      ideaId: id,
    },
  });

  return validation;
}
