// app/gallery/_lib/types.ts
export type FeedItem = {
    id: number;
    uuid: number;
    business_type: string;
    generated_image_id: number;
    image_url: string;
    picked: boolean;
    created_at: string; // ISO 8601
    pick_count?: number; // 일부 API(토글/상세)에서 최신값 제공
};

export type FeedListResponse = {
    feeds: FeedItem[];
    offset: number;
    limit: number;
    total: number;
};

export type FeedDetail = {
    id: number;
    uuid: number;
    nickname: string;
    business_type: string;
    generated_image_id: number;
    image_url: string;
    before_image_url: string;
    prompt?: string | null;
    user_tag?: string[] | null;
    picked: boolean;
    pick_count: number;
    created_at: string; // ISO 8601
    is_mine: boolean;   // 🔧 필수로 변경
};
