import { appConfig } from "./config";

export const pageSize = 40;

export function getTotalPages(totalCount: number): number {
  return Math.ceil(totalCount / pageSize);
}

export const handleDownloadClick = async (url: string) => {
  // Method 1
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const objUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = objUrl;
    link.download = `${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    // If method 1 fails, this will work...
    const link = document.createElement("a");
    link.href = url;
    link.download = `${Date.now()}.png`;
    link.rel = "noopener noreferrer";
    link.target = "_blank";
    link.style.display = "none";

    // Open the link in a new tab and focus it.
    window.open(link.href, link.target);
    window.focus();
  }
};

export function getInitials(fullName: string) {
  let initials = "";

  fullName.split(" ").forEach((name) => {
    if (name) initials += name[0]?.toUpperCase();
  });

  return initials;
}

export function generateOTP(length: number): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters[randomIndex];
  }

  return otp.toUpperCase();
}

export function getFileUrl(key: string) {
  return `https://utfs.io/f/${key}`;
}

export const getCurrencySymbol = (currencyCode: string): string => {
  return (
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .formatToParts(1)
      .find((part) => part.type === "currency")?.value || ""
  );
};

export const postToParent = (message: string) => {
  window?.parent?.postMessage(message, "*");
};

export const extractURLfromString = (url: string) => {
  return url?.match(/https?:\/\/[^\s"<>]+/);
};

export const extractEmailsFromString = (text: string) => {
  return text?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
};

export const getURL = (path: string) => {
  if (process.env.NODE_ENV === "development") {
    return `http://localhost:3000/${path}`;
  } else {
    return `${appConfig.app_domain}/${path}`;
  }
};

export function formatNumberShort(num: number): string {
  if (num < 1000) {
    return num.toString();
  }

  const suffixes = ["", "k", "M", "B", "T"];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const suffix = suffixes[magnitude] || "";
  const scaledNumber = num / Math.pow(10, magnitude * 3);

  if (scaledNumber < 10) {
    return scaledNumber.toFixed(1) + suffix;
  } else {
    return Math.floor(scaledNumber) + suffix;
  }
}
