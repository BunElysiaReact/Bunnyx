import React from "react";
import { createRoot } from "react-dom/client";
import { Router, routes } from "./router.js";

const root = createRoot(document.getElementById("root"));
root.render(React.createElement(Router, { routes }));