"use client";

import { useRef } from "react";

type Props = React.FormHTMLAttributes<HTMLFormElement>;

export function AutoSubmitForm({ children, ...props }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <form ref={formRef} onChange={() => formRef.current?.requestSubmit()} {...props}>
      {children}
    </form>
  );
}
