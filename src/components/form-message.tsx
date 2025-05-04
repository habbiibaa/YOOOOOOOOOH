"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";

export type Message = {
  type: "error" | "success" | "info";
  text: string;
} | {
  error?: string;
  success?: string;
  message?: string;
};

interface FormMessageProps {
  message?: Message;
  className?: string;
}

export function FormMessage({ message, className = "" }: FormMessageProps) {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const urlSuccess = searchParams.get("success");

  let displayMessage: { type: string; text: string } | null = null;

  if (message) {
    if ("type" in message && message.text) {
      displayMessage = message;
    } else if ("error" in message && message.error) {
      displayMessage = { type: "error", text: message.error };
    } else if ("success" in message && message.success) {
      displayMessage = { type: "success", text: message.success };
    } else if ("message" in message && message.message) {
      displayMessage = { type: "info", text: message.message };
    }
  }

  if (!displayMessage) {
    if (urlError) {
      displayMessage = { type: "error", text: decodeURIComponent(urlError) };
    } else if (urlSuccess) {
      displayMessage = { type: "success", text: decodeURIComponent(urlSuccess) };
    }
  }

  if (!displayMessage) {
    return null;
  }

  let bgColor = "";
  let textColor = "";
  let IconComponent: React.ElementType | null = null;

  switch (displayMessage.type) {
    case "error":
      bgColor = "bg-red-50";
      textColor = "text-red-700";
      IconComponent = AlertCircle;
      break;
    case "success":
      bgColor = "bg-green-50";
      textColor = "text-green-700";
      IconComponent = CheckCircle2;
      break;
    case "info":
      bgColor = "bg-blue-50";
      textColor = "text-blue-700";
      break;
    default:
      textColor = "text-foreground";
      break;
  }

  return (
    <div
      className={`flex items-start gap-2 w-full p-3 rounded-md text-sm ${bgColor} ${textColor} ${className}`}
      role="alert"
    >
      {IconComponent && <IconComponent className="h-5 w-5 flex-shrink-0" />}
      <div>{displayMessage.text}</div>
    </div>
  );
}