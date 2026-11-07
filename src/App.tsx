import AdminApp from "./admin/admin";
import UserApp from "./user/user";
import { useHash } from "./hooks/useHash";

export default function App() {
  const hash = useHash();
  const isAdmin = hash === "admin" || hash.startsWith("admin/");
  return isAdmin ? <AdminApp route={hash} /> : <UserApp />;
}