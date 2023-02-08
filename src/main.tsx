import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  defer,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import "./index.css";
import { ExternalLayout } from "./layouts/ExternalLayout";
import { ProtectedLayout } from "./layouts/ProtectedLayout";
import { RootLayout } from "./layouts/RootLayout";
import Login from "./pages/auth/Login";
import config from "./Config";


const getUserData = async () => {
  const token = localStorage.getItem("token");
  if (!token || token === undefined || token === null) {
    localStorage.removeItem("user");
    return {}
  }

  const res = await fetch(`${config.AUTH_SERVER_URL}api/user`, {
    headers: {
      "Content-Type": "application/json",
      "authtoken": JSON.parse(token),
    },
  });
  if (res.status > 300) {
    localStorage.removeItem("user");
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      return {}
    }
    throw new Response(res.statusText, { status: res.status });
  }
  localStorage.setItem("user", JSON.stringify(await res.json()));
  return {}
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}
      loader={() => defer({ userPromise: getUserData() })}
    >
      <Route element={<ExternalLayout />}>
        <Route path="/auth/login" element={<Login />} />
      </Route>

      <Route path="/" element={<ProtectedLayout />}>
        <Route path="" element={<App />} />

      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);