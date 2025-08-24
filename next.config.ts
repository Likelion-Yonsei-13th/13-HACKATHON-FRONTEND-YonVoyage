import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // 🔹 Mock 데이터 (지금 개발 중에 쓰는 picsum.photos)
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            // 🔹 백엔드 API가 실제로 이미지 URL을 돌려줄 도메인 (예: example.com, cdn.mydomain.com)
            {
                protocol: "https",
                hostname: "example.com",
            },
            // 필요하면 여러 개 추가 가능
            // {
            //   protocol: "https",
            //   hostname: "cdn.myproject.com",
            // (이미지 url이 "image_url": "https://cdn.myproject.com/images/987.jpg"인 경우)
            // },
        ],
    },
};

export default nextConfig;
