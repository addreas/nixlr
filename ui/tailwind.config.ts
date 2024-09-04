import { type Config } from "tailwindcss";
import type plugin from "tailwindcss/plugin";

import typography from "@tailwindcss/typography";
import daisyui from "daisyui";

export default {
  content: ["{routes,islands,components}/**/*.{ts,tsx}"],
  plugins: [typography, daisyui as unknown as ReturnType<typeof plugin>],
} satisfies Config;
