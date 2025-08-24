// app/gallery/_lib/constants.ts
export const CATEGORIES = [
    "한식",
    "일식",
    "양식",
    "디저트",
    "베이커리",
    "카페",
    "패스트푸드",
    "퓨전",
    "채식",
    "바",
] as const;

export type BusinessType = (typeof CATEGORIES)[number];

export const DEFAULT_LIMIT = 20;
