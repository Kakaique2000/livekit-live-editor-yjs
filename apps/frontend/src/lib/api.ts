import { treaty } from "@elysiajs/eden";
import type { App } from "backend";

export const apiClient = treaty<App>('http://localhost:4000');