// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Next.js 권장 설정
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),
  // 내 프로젝트 규칙 오버라이드
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn", // error → warn
      "prefer-const": "off", // 필요하면 이 에러도 끔
    },
  },
];
