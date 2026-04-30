import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft } from 'lucide-react'

export const metadata = {
  title: '利用規約 | 離乳食記録アプリ',
}

export default function TermsPage() {
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
            <h1 className="text-2xl font-bold text-gray-900">利用規約</h1>
            <p className="text-sm text-gray-500 mt-1">最終更新日：2025年5月1日</p>
          </div>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第1条（適用）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本利用規約（以下「本規約」）は、本アプリ「離乳食記録アプリ」（以下「本サービス」）の利用条件を定めるものです。
              ユーザーの皆様は、本規約に同意のうえ本サービスをご利用ください。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第2条（利用登録）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本サービスの利用を希望する方は、本規約に同意のうえ、所定の方法により利用登録を申請してください。
              登録申請者が以下のいずれかに該当する場合、利用登録を拒否することがあります。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>虚偽の内容で申請した場合</li>
              <li>本規約に違反したことがある方からの申請の場合</li>
              <li>その他、運営者が不適切と判断した場合</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第3条（禁止事項）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>サーバーやネットワークに過度な負荷をかける行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
              <li>不正アクセスをし、またはこれを試みる行為</li>
              <li>本サービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
              <li>その他、運営者が不適切と判断する行為</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第4条（本サービスの提供の停止等）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              運営者は、以下のいずれかに該当する場合、ユーザーへの事前通知なく本サービスの全部または一部の提供を停止または中断することができます。
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 pl-2">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>その他、運営者が本サービスの提供が困難と判断した場合</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第5条（免責事項）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本サービスに掲載している離乳食に関する情報は一般的な情報提供を目的としており、
              医療上のアドバイスを提供するものではありません。
              お子様の食物アレルギーや健康状態については、必ず医師または専門家にご相談ください。
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mt-2">
              運営者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、
              連絡または紛争等について一切責任を負いません。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第6条（サービス内容の変更等）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              運営者は、ユーザーへの事前通知なく、本サービスの内容を変更しまたは本サービスの提供を中止することができます。
              これによってユーザーに生じた損害について、運営者は一切の責任を負いません。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第7条（利用規約の変更）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              運営者は必要と判断した場合、ユーザーへの事前通知なく本規約を変更することができます。
              変更後の利用規約は、本サービス上に掲示した時点から効力を生じるものとします。
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-800">第8条（準拠法・裁判管轄）</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              本規約の解釈にあたっては、日本法を準拠法とします。
              本サービスに関して紛争が生じた場合には、運営者の所在地を管轄する裁判所を専属的合意管轄とします。
            </p>
          </section>

          <div className="pt-4 border-t border-gray-100 text-center">
            <Link href="/privacy" className="text-orange-600 hover:underline text-sm">
              プライバシーポリシーを確認する →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
