import { defineConfig } from "vitepress";

const englishNav = [
  { text: "Guide", link: "/guide/getting-started" },
  { text: "Console", link: "/console/overview" },
  { text: "SDKs", link: "/platforms/web" },
  { text: "API Reference", link: "/reference/overview" },
];

const koreanNav = [
  { text: "가이드", link: "/ko/guide/getting-started" },
  { text: "콘솔", link: "/ko/console/overview" },
  { text: "SDK", link: "/ko/platforms/web" },
  { text: "API 레퍼런스", link: "/ko/reference/overview" },
];

const englishSidebar = [
  {
    text: "Guide",
    items: [
      { text: "Getting Started", link: "/guide/getting-started" },
      { text: "SDK Behavior", link: "/guide/architecture" },
      { text: "Error Codes", link: "/guide/error-codes" },
    ],
  },
  {
    text: "Console",
    items: [
      { text: "Overview", link: "/console/overview" },
      { text: "Projects & API Keys", link: "/console/projects-api-keys" },
      { text: "Login Providers", link: "/console/login-providers" },
      { text: "Operations", link: "/console/operations" },
      { text: "Payments", link: "/console/payments" },
      { text: "Webhooks & Server Keys", link: "/console/webhooks" },
      { text: "Players & Sanctions", link: "/console/players" },
    ],
  },
  {
    text: "Platform SDKs",
    items: [
      { text: "Web", link: "/platforms/web" },
      { text: "Unity", link: "/platforms/unity" },
      { text: "Android", link: "/platforms/android" },
      { text: "iOS", link: "/platforms/ios" },
      { text: "Godot", link: "/platforms/godot" },
    ],
  },
  {
    text: "API Reference",
    items: [
      { text: "Overview & Conventions", link: "/reference/overview" },
      { text: "Auth", link: "/reference/auth" },
      { text: "Notice", link: "/reference/notice" },
      { text: "Mailbox", link: "/reference/mailbox" },
      { text: "Payment", link: "/reference/payment" },
      { text: "Errors", link: "/reference/errors" },
    ],
  },
];

const koreanSidebar = [
  {
    text: "가이드",
    items: [
      { text: "시작하기", link: "/ko/guide/getting-started" },
      { text: "SDK 동작", link: "/ko/guide/architecture" },
      { text: "에러 코드", link: "/ko/guide/error-codes" },
    ],
  },
  {
    text: "콘솔",
    items: [
      { text: "개요", link: "/ko/console/overview" },
      { text: "프로젝트와 API 키", link: "/ko/console/projects-api-keys" },
      { text: "로그인 제공자", link: "/ko/console/login-providers" },
      { text: "운영", link: "/ko/console/operations" },
      { text: "결제", link: "/ko/console/payments" },
      { text: "웹훅과 서버 키", link: "/ko/console/webhooks" },
      { text: "플레이어와 제재", link: "/ko/console/players" },
    ],
  },
  {
    text: "플랫폼 SDK",
    items: [
      { text: "Web", link: "/ko/platforms/web" },
      { text: "Unity", link: "/ko/platforms/unity" },
      { text: "Android", link: "/ko/platforms/android" },
      { text: "iOS", link: "/ko/platforms/ios" },
      { text: "Godot", link: "/ko/platforms/godot" },
    ],
  },
  {
    text: "API 레퍼런스",
    items: [
      { text: "개요와 규칙", link: "/ko/reference/overview" },
      { text: "Auth", link: "/ko/reference/auth" },
      { text: "Notice", link: "/ko/reference/notice" },
      { text: "Mailbox", link: "/ko/reference/mailbox" },
      { text: "Payment", link: "/ko/reference/payment" },
      { text: "Errors", link: "/ko/reference/errors" },
    ],
  },
];

export default defineConfig({
  lang: "en-US",
  title: "Hive Axyl",
  description:
    "Client SDKs and operations console for the Hive Axyl game platform",
  base: process.env.DOCS_BASE ?? "/",
  lastUpdated: true,
  themeConfig: {
    search: { provider: "local" },
    nav: englishNav,
    sidebar: englishSidebar,
    outline: { level: [2, 3] },
    footer: {
      message: "Hive Axyl Game Platform Documentation",
    },
  },
  locales: {
    root: {
      label: "English",
      lang: "en-US",
      link: "/",
    },
    ko: {
      label: "한국어",
      lang: "ko-KR",
      link: "/ko/",
      title: "Hive Axyl",
      description: "Hive Axyl 게임 플랫폼 클라이언트 SDK와 운영 콘솔 문서",
      themeConfig: {
        search: { provider: "local" },
        nav: koreanNav,
        sidebar: koreanSidebar,
        outline: { level: [2, 3] },
        footer: {
          message: "Hive Axyl 게임 플랫폼 문서",
        },
      },
    },
  },
});
