import { Bell, CalendarDays, Home, LogOut, PlusCircle, Settings, ShieldCheck, User, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = {
  student: [
    ["Dashboard", "/student", Home],
    ["Registered", "/registered", CalendarDays],
    ["Notifications", "/notifications", Bell],
    ["Verification", "/verification", ShieldCheck],
    ["Profile", "/profile", User],
    ["Settings", "/settings", Settings]
  ],
  club_admin: [
    ["Dashboard", "/club", Home],
    ["Create Event", "/events/new", PlusCircle],
    ["Profile", "/profile", User],
    ["Settings", "/settings", Settings]
  ],
  super_admin: [
    ["Dashboard", "/admin", Home],
    ["Verifications", "/verification", ShieldCheck],
    ["Notifications", "/notifications", Bell],
    ["Settings", "/settings", Settings]
  ]
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = links[user.role] || [];
  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-white p-4 lg:block">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-brand text-lg font-black text-white">CE</div>
          <div>
            <p className="font-bold">Campus Events</p>
            <p className="text-xs capitalize text-neutral-500">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? "bg-brand text-white" : "text-neutral-700 hover:bg-mist"}`}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <button
          className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-mist"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-line bg-white/90 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-500">Welcome back</p>
              <h1 className="text-xl font-bold">{user.name}</h1>
            </div>
            <Users className="text-brand" />
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map(([label, href]) => (
              <NavLink key={href} to={href} className="shrink-0 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold">
                {label}
              </NavLink>
            ))}
          </div>
        </header>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
