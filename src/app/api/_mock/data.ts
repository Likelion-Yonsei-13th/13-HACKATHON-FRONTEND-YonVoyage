// src/app/api/_mock/data.ts
export type MockFeed = {
    id: number;
    uuid: number;
    business_type: string;
    generated_image_id: number;
    image_url: string;
    picked: boolean;
    created_at: string;
};

const categories = [
    "한식","일식","양식","디저트","베이커리",
    "카페","패스트푸드","퓨전","패식","바",
] as const;

export const mockFeeds: MockFeed[] = Array.from({ length: 120 }, (_, i) => ({
    id: 1000 + i,
    uuid: 40 + (i % 5),
    business_type: categories[i % categories.length],
    generated_image_id: 9000 + i,
    image_url: `https://picsum.photos/seed/food${i}/600/800`,
    picked: i % 3 === 0,
    created_at: new Date(Date.now() - i * 3600_000).toISOString(),
}));
