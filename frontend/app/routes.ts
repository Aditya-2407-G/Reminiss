import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx", {
    //preload todo
  }),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  // route("yearbook/new", "routes/yearbook.new.tsx"),
//   route("entries/:id", "routes/entries.$id.tsx"),
  route("montage", "routes/montage.tsx"),
  route("messages", "routes/messages.tsx"),
  route("yearbook", "routes/yearbook.tsx"),
  route("profile", "routes/profile.tsx"),
] satisfies RouteConfig;