import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // 本番環境（Railway）
      {
        protocol: 'https',
        hostname: 'baby-food-pb-production.up.railway.app',
        pathname: '/api/files/**',
      },
      // ローカル開発環境
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8090',
        pathname: '/api/files/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // クリックジャッキング防止
          { key: 'X-Frame-Options', value: 'DENY' },
          // MIMEタイプスニッフィング防止
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS保護（古いブラウザ向け）
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // HTTPSを強制
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // リファラー情報の制限
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // 不要なブラウザ機能を無効化
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
};

export default nextConfig;
