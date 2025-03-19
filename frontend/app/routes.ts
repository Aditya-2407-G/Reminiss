import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("entries/new", "routes/entries.new.tsx"),
//   route("entries/:id", "routes/entries.$id.tsx"),
  route("montage", "routes/montage.tsx"),
  route("messages", "routes/messages.tsx"),
] satisfies RouteConfig;