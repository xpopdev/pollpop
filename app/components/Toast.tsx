"use client";
import { useEffect, useRef, useState } from "react";

export function Toast({ message }: { message: string }) {
  const [show, setShow] = useState(false);
  const last = useRef("");
  useEffect(() => {
    if (!message || message === last.current) return;
    last.current = message;
    setShow(true);
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, [message]);
  return <div className={`toast ${show ? "show" : ""}`}>{message}</div>;
}

export function useToast() {
  const [msg, setMsg] = useState("");
  return { msg, toast: (m: string) => setMsg(m + " " + Date.now().toString().slice(-4)), Toast: () => <Toast message={msg} /> };
}
