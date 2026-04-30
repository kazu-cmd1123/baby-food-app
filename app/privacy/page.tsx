import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: 'プライバシーポリシー | 離乳食記録アプリ',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/auth/register">
          <Button variant="ghost" className="mb-4 text-orange-700">
            <ChevronLeft size={16} className="mr-1" />
            戻る
          </Button>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">プライバシーポリシー</h1>
            <p className="text-sm text-gray-500 mt-1">最終更新日：2025年5月1日</p>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            本アプリ「離乳食記録アプリ」（以下「本サービス」）は、ユーザーの個人情報の取扱いについて、
            以下のとおりプライバシーポリシーを定めます。
          </p>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第1条（収集する情報）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本サービスでは、以下の情報を収集します。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>メールアドレス（アカウント登録時）</li>
              <li>お子様の名前・生年月日（任意登録）</li>
              <li>食事記録（食材名・量・時間・写真など）</li>
              <li>アレルギー記録</li>
              <li>食材プラン情報</li>
              <li>アクセスログ（IPアドレス、利用日時など）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第2条（情報の利用目的）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              収集した情報は以下の目的で利用します。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>本サービスの提供・運営</li>
              <li>ユーザー認証・アカウント管理</li>
              <li>本サービスの改善・新機能の開発</li>
              <li>不正利用の防止・セキュリティ対策</li>
              <li>お問い合わせへの対応</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第3条（第三者への提供）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              運営者は、以下の場合を除き、ユーザーの個人情報を第三者に提供しません。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>ユーザーの同意がある場合</li>
              <li>法令に基づく場合</li>
              <li>人の生命・身体・財産の保護のために必要な場合</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第4条（利用するサービス）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本サービスは、以下の外部サービスを利用しています。各サービスのプライバシーポリシーもご確認ください。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Vercel</strong>（アプリホスティング）—
                <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline ml-1">
                  プライバシーポリシー
                </a>
              </li>
              <li>
                <strong>Railway</strong>（データベースサーバー）—
                <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline ml-1">
                  プライバシーポリシー
                </a>
              </li>
            </ul>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              データはRailway上のサーバーに保存されます。データの保存場所はRailwayのインフラに依存します。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第5条（データの保管・セキュリティ）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              ユーザーのデータは暗号化通信（HTTPS）により保護されています。
              ただし、インターネット上の通信やデータ保存において完全な安全性を保証するものではありません。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第6条（ユーザーの権利）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              ユーザーは、自身の個人情報について以下の権利を有します。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>登録情報の確認・修正（設定ページより）</li>
              <li>アカウントおよびデータの削除（設定ページより、または問い合わせ）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第7条（子供のプライバシー）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本サービスは保護者によるお子様の食事記録を目的としています。
              お子様の情報（名前・生年月日など）は、アプリの機能提供のみに使用し、
              マーケティング目的での利用や第三者への提供は行いません。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第8条（プライバシーポリシーの変更）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本ポリシーの内容は、法令の変更やサービス内容の変更に伴い、予告なく変更することがあります。
              変更後のポリシーは、本ページに掲載した時点から効力を生じるものとします。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第9条（お問い合わせ）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              個人情報の取扱いに関するお問い合わせは、本サービス内のお問い合わせフォームよりご連絡ください。
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link href="/terms" className="text-orange-600 hover:underline text-sm">
              利用規約を確認する →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
