"use client";

import { useEffect, useRef } from "react";
import Swal from "sweetalert2";

type Props = {
  successMessage?: string;
  errorMessage?: string;
};

export function QueryToast({ successMessage, errorMessage }: Props) {
  const lastKeyRef = useRef<string>("");

  useEffect(() => {
    const message = errorMessage ?? successMessage;
    if (!message) {
      return;
    }

    const icon = errorMessage ? "error" : "success";
    const key = `${icon}:${message}`;

    if (lastKeyRef.current === key) {
      return;
    }

    lastKeyRef.current = key;

    void Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title: message,
      showConfirmButton: false,
      timer: 2600,
      timerProgressBar: true,
      customClass: {
        popup: "app-toast",
      },
    });
  }, [errorMessage, successMessage]);

  return null;
}
