import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  Navigate,
} from "react-router-dom";
import "./App.css";
import { LoginHeader } from "./components/LoginHeader";
import { AdminLogin } from "./components/AdminLogin";
import { Dashboard } from "./pages/Dashboard";
import { SuperAdminProtectedRoute } from "./components/SuperAdminProtectedRoute";
import { AddMember } from "./components/AddMember";
import { SideBar } from "./components/sidebar";
import { Report } from "./pages/report";
import { MemberList } from "./components/MemberList";
import { SiteBookingList } from "./components/SiteBookingList";
import { ReceiptList } from "./components/ReceiptsList";
import Payments from "./components/Payments";
import { SiteBookingForm } from "./components/SiteBookingForm";
import ReceiptForm from "./components/ReceiptForm";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SuperAdmin } from "./components/SuperAdmin";
import { SuperAdminDashboard } from "./pages/SuperAdminDashboard";
import { MemberLogin } from "./components/MemberLogin";
import { MemberProtectedRoute } from "./components/MemberProtectedRoute";
import { MemberDashboard } from "./components/MemberDashboard";

const MainApp = () => {
  const location = useLocation();

  const noSidebarRoutes = ["/adminlogin", "/memberlogin", "/", "/superadmin"];

  const superAdminRoutes = [
    "/superadmin/dashboard",
    "/superadmin/addmember",
    "/superadmin/sitebookingform",
    "/superadmin/receiptform",
    "/superadmin/report",
    "/superadmin/payments",
    "/superadmin/memberlist",
    "/superadmin/sitebookinglist",
    "/superadmin/receiptlist",
  ];

  const memberRoutes = ["/member/dashboard"];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Admin Sidebar */}
      {!noSidebarRoutes.includes(location.pathname) &&
        !superAdminRoutes.includes(location.pathname) &&
        !memberRoutes.includes(location.pathname) && <SideBar />}

      {/* SuperAdmin Sidebar */}
      {superAdminRoutes.includes(location.pathname) && (
        <SideBar prefix="/superadmin" />
      )}

      <div className="flex-1 overflow-y-auto">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/adminlogin" replace />} />
          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/memberlogin" element={<MemberLogin />} />
          <Route path="/loginheader" element={<LoginHeader />} />
          <Route path="/superadmin" element={<SuperAdmin />} />

          {/* SuperAdmin Protected Routes */}
          <Route
            path="/superadmin/dashboard"
            element={
              <SuperAdminProtectedRoute>
                <SuperAdminDashboard />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/addmember"
            element={
              <SuperAdminProtectedRoute>
                <AddMember />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/sitebookingform"
            element={
              <SuperAdminProtectedRoute>
                <SiteBookingForm />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/receiptform"
            element={
              <SuperAdminProtectedRoute>
                <ReceiptForm />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/report"
            element={
              <SuperAdminProtectedRoute>
                <Report />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/payments"
            element={
              <SuperAdminProtectedRoute>
                <Payments />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/memberlist"
            element={
              <SuperAdminProtectedRoute>
                <MemberList />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/sitebookinglist"
            element={
              <SuperAdminProtectedRoute>
                <SiteBookingList />
              </SuperAdminProtectedRoute>
            }
          />
          <Route
            path="/superadmin/receiptlist"
            element={
              <SuperAdminProtectedRoute>
                <ReceiptList />
              </SuperAdminProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receiptform"
            element={
              <ProtectedRoute>
                <ReceiptForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addmember"
            element={
              <ProtectedRoute>
                <AddMember />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <Report />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sitebookingform"
            element={
              <ProtectedRoute>
                <SiteBookingForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/memberlist"
            element={
              <ProtectedRoute>
                <MemberList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sitebookinglist"
            element={
              <ProtectedRoute>
                <SiteBookingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receiptlist"
            element={
              <ProtectedRoute>
                <ReceiptList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            }
          />

          {/* Member Protected Routes */}
          <Route
            path="/member/dashboard"
            element={
              <MemberProtectedRoute>
                <MemberDashboard />
              </MemberProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/adminlogin" replace />} />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;
