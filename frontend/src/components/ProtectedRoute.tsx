import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "../services/authApi";

type Props = {
  children: React.ReactElement;
  roles?: string[]; // require any of these roles
};

export default function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["auth/me"],
    queryFn: async () => (await authApi.me()).data,
    enabled: !!token,
    retry: 0,
  });

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (isLoading)
    return <div style={{ padding: 24 }}>Đang kiểm tra phiên...</div>;
  if (isError || !data) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (roles && roles.length > 0) {
    const hasRole = data.roles?.some((r) => roles.includes(r));
    if (!hasRole) return <Navigate to="/403" replace />;
  }

  return children;
}
