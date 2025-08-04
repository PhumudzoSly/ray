"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function checkLoopsSubscription(email: string) {
  try {
    const response = await fetch(`https://app.loops.so/api/v1/contacts/find?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${process.env.LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to check subscription status");
    }

    const data = await response.json();
    
    // Check if contact exists and is subscribed
    return data && data.length > 0 && data[0].subscribed === true;
  } catch (error) {
    console.error("Error checking Loops subscription:", error);
    return false;
  }
}

export async function subscribeToLoops(email: string) {
  try {
    const response = await fetch("https://app.loops.so/api/v1/contacts/update", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        subscribed: true,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to subscribe to Loops");
    }

    return { success: true };
  } catch (error) {
    console.error("Error subscribing to Loops:", error);
    return { success: false, error: "Failed to subscribe" };
  }
}

export async function unsubscribeFromLoops(email: string) {
  try {
    const response = await fetch("https://app.loops.so/api/v1/contacts/update", {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${process.env.LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        subscribed: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to unsubscribe from Loops");
    }

    return { success: true };
  } catch (error) {
    console.error("Error unsubscribing from Loops:", error);
    return { success: false, error: "Failed to unsubscribe" };
  }
}

export async function updateLoopsSubscription(email: string, subscribed: boolean) {
  if (subscribed) {
    return await subscribeToLoops(email);
  } else {
    return await unsubscribeFromLoops(email);
  }
}