import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { pageview } from "../lib/ga";

export default function GAListener() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    pageview(`${pathname}${search || ""}`);
  }, [pathname, search]);
  return null;
}


