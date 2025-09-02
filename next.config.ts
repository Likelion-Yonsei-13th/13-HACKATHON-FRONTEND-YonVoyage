import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // 🔹 Mock 데이터 (개발용)
            {
                protocol: "https",
                hostname: "picsum.photos",
            },
            // 🔹 테스트용 예시 도메인
            {
                protocol: "https",
                hostname: "example.com",
            },
            // 🔹 실제 S3 버킷 도메인
            {
                protocol: "https",
                hostname: "pixplawsbucket.s3.ap-northeast-2.amazonaws.com",
            },
            // 🔹 백엔드 API 도메인
            {
                protocol: "https",
                hostname: "pixpl.com",
            },
        ],
    },
};

export default nextConfig;
