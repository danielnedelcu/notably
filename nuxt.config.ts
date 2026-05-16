// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  ssr: true,
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/supabase",
    "@vueuse/nuxt",
    "@yuta-inoue-ph/nuxt-vcalendar",
    "vue-sonner/nuxt",
    "@vee-validate/nuxt",
    "nuxt-gtag",
  ],

  fonts: {
    families: [
      { name: "Roboto", provider: "google" },
      {
        name: "Jost",
        provider: "google",
        weights: [100, 300, 400],
        styles: ["normal", "italic"],
      },
      { name: "Baskervville", provider: "google" },
      { name: "Prata", provider: "google" },
      { name: "Cormorant", provider: "google" },
      { name: "Lora", provider: "google" },
      { name: "Sorts Mill Goudy", provider: "google" },
      { name: "DM Serif Display", provider: "google" },
    ],
  },

  components: [
    {
      path: "~/components/Ui/alert-dialog/AlertDialog",
      prefix: "UiAlertDialog",
      pathPrefix: false,
    },
    { path: "~/components/Ui/tabs/Tabs", prefix: "UiTabs", pathPrefix: false },
    {
      path: "~/components/Ui/input-group/InputGroup",
      prefix: "UiInputGroup",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/tooltip/Tooltip",
      prefix: "UiTooltip",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/accordion/Accordion",
      prefix: "UiAccordion",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/button-group/ButtonGroup",
      prefix: "UiButtonGroup",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/popover/Popover",
      prefix: "UiPopover",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/scroll-area/ScrollArea",
      prefix: "UiScrollArea",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/dropdown-menu/DropdownMenu",
      prefix: "UiDropdownMenu",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/avatar/Avatar",
      prefix: "UiAvatar",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/card/Card",
      prefix: "UiCard",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/sheet/Sheet",
      prefix: "UiSheet",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/sidebar/Sidebar",
      prefix: "UiSidebar",
      pathPrefix: false,
    },
    {
      path: "~/components/Ui/collapsible",
      prefix: "UiCollapsible",
      pathPrefix: false,
    },
    { path: "~/components/Ui/vee/Vee", prefix: "UiVee", pathPrefix: false },
    {
      path: "~/components/Ui/pagination",
      prefix: "UiPagination",
      pathPrefix: false,
    },
    { path: "~/components/Ui/item", prefix: "UiItem", pathPrefix: false },
    {
      path: "~/components/Ui",
      prefix: "Ui",
      pathPrefix: false,
      ignore: [
        "alert-dialog/AlertDialog/**",
        "tabs/Tabs/**",
        "input-group/InputGroup/**",
        "tooltip/Tooltip/**",
        "accordion/Accordion/**",
        "button-group/ButtonGroup/**",
        "popover/Popover/**",
        "scroll-area/ScrollArea/**",
        "dropdown-menu/DropdownMenu/**",
        "avatar/Avatar/**",
        "card/Card/**",
        "sheet/Sheet/**",
        "sidebar/Sidebar/**",
        "collapsible/**",
        "vee/Vee/**",
        "pagination/**",
        "item/**",
      ],
    },
    { path: "~/components" },
  ],

  imports: {
    imports: [
      { from: "tailwind-variants", name: "tv" },
      { from: "tailwind-variants", name: "VariantProps", type: true },
      {
        from: "vue-sonner",
        name: "toast",
        as: "useSonner",
      },
    ],
  },
  supabase: {
    types: fileURLToPath(
      new URL("./app/types/database.types.ts", import.meta.url),
    ),
    redirect: false,
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/posts/*"],
    },
    clientOptions: {
      auth: {
        flowType: "pkce", // Most secure auth flow
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    },
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      supabaseSecretKey: process.env.SUPABASE_SECRET_KEY,
    },
  },
  vite: {
    // plugins: [tailwindcss()],
  },
  scheduledTasks: {
    "0 * * * *": ["cleanup:empty-posts"], // runs every hour
  },
  gtag: {
    enabled: true, //process.env.NODE_ENV === "production",
    id: process.env.GA_MEASUREMENT_ID,
  },
});
