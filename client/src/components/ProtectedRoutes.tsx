import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  isAllowed: boolean; // Is the user logged in?
  redirectPath?: string; // Where to send them if they fail?
  children?: React.ReactNode;
}

const ProtectedRoutes = ({
  isAllowed,
  redirectPath = "/login",
  children,
}: ProtectedRouteProps) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  // If there are children (like a specific layout), render them.
  // Otherwise, render the child route (Outlet).
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoutes;
