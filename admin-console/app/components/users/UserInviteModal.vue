<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { PERMISSION_TEMPLATES } from '~/utils/permissions'

const open = ref(false)
const db = useMockDb()
const toast = useToast()
const { record } = useAuditLog()

const departments = ['開発部', '運営部', 'CS部', 'データ分析部', 'マーケティング部', '経営企画部']

const schema = z.object({
  name: z.string().min(2, '氏名を入力してください'),
  email: z.email('メールアドレスの形式が正しくありません').refine(v => !db.value.users.some(u => u.email === v), 'このメールアドレスは登録済みです'),
  department: z.string().min(1, '部署を選択してください'),
  title: z.string().optional(),
  templateId: z.string().min(1)
})
type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({ templateId: 'viewer', department: undefined })

const selectedTemplate = computed(() => findTemplate(state.templateId))

function onSubmit(event: FormSubmitEvent<Schema>) {
  const template = findTemplate(event.data.templateId)!
  const id = `U-${String(db.value.users.length + 1).padStart(4, '0')}`
  db.value.users.unshift({
    id,
    name: event.data.name,
    email: event.data.email,
    department: event.data.department,
    title: event.data.title || 'メンバー',
    status: 'invited',
    permissions: [...template.permissions],
    templateId: template.id,
    twoFactor: false,
    lastLoginAt: null,
    createdAt: new Date().toISOString()
  })
  record({ category: 'user', action: 'ユーザーを招待', target: event.data.email, detail: `テンプレート：${template.label}` })
  toast.add({ title: '招待メールを送信しました（モック）', description: event.data.email, color: 'success', icon: 'i-lucide-mail-check' })
  open.value = false
  Object.assign(state, { name: undefined, email: undefined, department: undefined, title: undefined, templateId: 'viewer' })
}
</script>

<template>
  <UModal v-model:open="open" title="ユーザーを招待" description="管理ツールの利用者を追加します。初期権限はテンプレートから選択し、後から個別に変更できます。">
    <UButton label="ユーザーを招待" icon="i-lucide-user-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <UFormField label="氏名" name="name" required>
            <UInput v-model="state.name" placeholder="山田 花子" class="w-full" />
          </UFormField>
          <UFormField label="メールアドレス" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="hanako@example.com" class="w-full" />
          </UFormField>
          <UFormField label="部署" name="department" required>
            <USelect v-model="state.department" :items="departments" placeholder="選択してください" class="w-full" />
          </UFormField>
          <UFormField label="役職" name="title">
            <UInput v-model="state.title" placeholder="例：ゲームプランナー" class="w-full" />
          </UFormField>
        </div>

        <UFormField label="初期権限テンプレート" name="templateId" :description="selectedTemplate?.description">
          <USelect v-model="state.templateId" :items="PERMISSION_TEMPLATES.map(t => ({ label: t.label, value: t.id }))" class="w-full" />
        </UFormField>

        <div v-if="selectedTemplate" class="flex flex-wrap gap-1">
          <UBadge v-for="p in selectedTemplate.permissions" :key="p" :label="permissionLabel(p)" color="neutral" variant="subtle" size="sm" />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <UButton label="キャンセル" color="neutral" variant="ghost" @click="open = false" />
          <UButton label="招待を送信" type="submit" icon="i-lucide-send" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
