<script setup lang="ts">
import { ALL_PERMISSIONS, PERMISSIONS, ROLES } from '~/utils/access'

useHead({ title: '権限による表示切替' })

const { role } = useAccess()
const toast = useToast()

const code = `<script setup lang="ts">
const { can } = useAccess()   // ログインユーザーの権限
<\/script>

<template>
  <!-- 非表示：権限が無ければ出さない -->
  <AccessGuard permission="users.edit">
    <UButton label="編集" />
  </AccessGuard>

  <!-- 操作不可：出すけれど押せない（理由をツールチップ表示） -->
  <AccessGuard permission="notice.publish" mode="disable">
    <UButton label="公開する" />
  </AccessGuard>

  <!-- 伏せ字：数値や個人情報を隠す -->
  <AccessGuard permission="sales.view" mode="mask">
    <p>{{ formatYen(sales) }}</p>
  </AccessGuard>

  <!-- スクリプト内での判定 -->
  <UButton v-if="can(['users.view', 'sales.view'], 'any')" label="レポート" />
</template>`

const propsTable = [
  { name: 'permission', type: 'Permission | Permission[]', description: '必要な権限' },
  { name: 'match', type: "'all' | 'any'", default: "'all'", description: '複数指定時に、すべて必要か・どれか 1 つでよいか' },
  { name: 'mode', type: "'hide' | 'disable' | 'mask'", default: "'hide'", description: '権限が無いときの見せ方' },
  { name: '#fallback', type: 'slot', description: 'hide のとき、代わりに表示する内容' }
]
</script>

<template>
  <PartDoc
    title="権限による表示切替"
    file="components/parts/AccessGuard.vue / composables/useAccess.ts"
    summary="ログインユーザーの権限によって、メニュー・ボタン・数値の見せ方を切り替えます。見せ方は「非表示」「操作不可」「伏せ字」の 3 通りから選べます。"
    :points="['メニューや画面単位は「非表示」', '存在は知らせたい操作は「操作不可」＋理由のツールチップ', '売上や個人情報は「伏せ字」', '判定は useAccess().can() に集約（本番は API の権限一覧を入れる）']"
    :code="code"
    :props="propsTable"
  >
    <template #controls>
      <span class="flex items-center gap-2"><span class="text-xs text-muted">ログインユーザーの役割</span><RoleSwitcher size="sm" /></span>
      <UBadge :label="role.description" :color="role.color" variant="subtle" />
    </template>

    <template #demo>
      <div class="grid gap-px bg-(--ui-border) md:grid-cols-3">
        <div class="space-y-3 bg-default p-5">
          <p class="text-xs font-medium text-muted">
            非表示（hide）
          </p>
          <div class="flex flex-wrap gap-2">
            <UButton label="お知らせを見る" color="neutral" variant="outline" size="sm" />
            <AccessGuard permission="users.edit">
              <UButton label="ユーザーを編集" icon="i-lucide-pencil" size="sm" />
              <template #fallback>
                <span class="self-center text-xs text-dimmed">（「ユーザーを編集」ボタンは非表示）</span>
              </template>
            </AccessGuard>
          </div>
        </div>
        <div class="space-y-3 bg-default p-5">
          <p class="text-xs font-medium text-muted">
            操作不可（disable）
          </p>
          <div class="flex flex-wrap gap-2">
            <AccessGuard permission="notice.edit" mode="disable">
              <UButton label="下書き保存" color="neutral" variant="outline" size="sm" @click="toast.add({ title: '下書きを保存しました' })" />
            </AccessGuard>
            <AccessGuard permission="notice.publish" mode="disable">
              <UButton label="公開する" icon="i-lucide-send" size="sm" @click="toast.add({ title: '公開しました', color: 'success' })" />
            </AccessGuard>
          </div>
        </div>
        <div class="space-y-3 bg-default p-5">
          <p class="text-xs font-medium text-muted">
            伏せ字（mask）
          </p>
          <div>
            <p class="text-xs text-muted">
              本日の売上
            </p>
            <AccessGuard permission="sales.view" mode="mask">
              <p class="text-2xl font-semibold text-highlighted tabular-nums">
                ¥8,412,300
              </p>
            </AccessGuard>
          </div>
        </div>
      </div>
    </template>

    <template #extra>
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-highlighted">
          役割と権限の対応（サンプル定義：utils/access.ts）
        </h3>
        <div class="overflow-x-auto rounded-lg border border-default">
          <table class="w-full min-w-[40rem] text-sm">
            <thead class="bg-elevated/50 text-xs text-muted">
              <tr>
                <th class="px-4 py-2 text-left font-medium">
                  権限
                </th>
                <th v-for="r in ROLES" :key="r.id" class="px-3 py-2 text-center font-medium" :class="r.id === role.id ? 'text-primary' : ''">
                  {{ r.label }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-default">
              <tr v-for="p in ALL_PERMISSIONS" :key="p">
                <td class="px-4 py-2">
                  {{ PERMISSIONS[p] }} <code class="ms-1 text-xs text-muted">{{ p }}</code>
                </td>
                <td v-for="r in ROLES" :key="r.id" class="px-3 py-2 text-center" :class="r.id === role.id ? 'bg-primary/5' : ''">
                  <UIcon :name="r.permissions.includes(p) ? 'i-lucide-check' : 'i-lucide-x'" :class="r.permissions.includes(p) ? 'size-4 text-primary' : 'size-4 text-dimmed'" :aria-label="r.permissions.includes(p) ? 'あり' : 'なし'" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted">
          ※ 画面での出し分けは見た目の制御です。実際に操作できるかどうかは、必ずサーバー側でも判定してください。
        </p>
      </div>
    </template>
  </PartDoc>
</template>
