<script setup lang="ts">
const route = useRoute()
const user = computed(() => USERS.find(u => String(u.id) === route.params.id) ?? USERS[0]!)
const orders = computed(() => ORDERS.filter((_, i) => i % 7 === user.value.id % 7).slice(0, 6))
const logs = computed(() => AUDIT_LOGS.slice(0, 5))
const tab = ref('profile')
const form = reactive({ name: '', email: '', role: '' })
watchEffect(() => Object.assign(form, { name: user.value.name, email: user.value.email, role: user.value.role }))
const toast = useToast()
const { current } = useAppEnv()
const confirmOpen = ref(false)
</script>

<template>
  <PageShell id="user-detail" :title="user.name" icon="i-lucide-user">
    <template #actions>
      <UButton to="/users" icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm" label="一覧へ" />
      <UButton color="error" variant="outline" size="sm" icon="i-lucide-ban" label="利用停止" @click="confirmOpen = true" />
    </template>

    <div class="grid grid-cols-[280px_1fr] gap-6">
      <UCard>
        <div class="flex flex-col items-center text-center gap-2">
          <UAvatar :text="user.name[0]" size="3xl" />
          <p class="font-semibold text-highlighted text-lg">{{ user.name }}</p>
          <p class="text-sm text-muted">{{ user.email }}</p>
          <div class="flex gap-2">
            <UBadge :color="USER_STATUS[user.status].color" variant="subtle">{{ USER_STATUS[user.status].label }}</UBadge>
            <UBadge color="neutral" variant="outline">{{ roleName(user.role) }}</UBadge>
          </div>
        </div>
        <USeparator class="my-4" />
        <dl class="text-sm space-y-2">
          <div class="flex justify-between"><dt class="text-muted">ユーザーID</dt><dd class="font-mono">#{{ user.id }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">登録日</dt><dd>{{ fmtDate(user.createdAt).slice(0, 10) }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">最終ログイン</dt><dd>{{ fmtDate(user.lastLogin) }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">MFA</dt><dd>{{ user.mfa ? '有効' : '無効' }}</dd></div>
          <div class="flex justify-between"><dt class="text-muted">累計注文</dt><dd class="tabular-nums">{{ user.orders }} 件</dd></div>
        </dl>
      </UCard>

      <div>
        <UTabs v-model="tab" variant="link" :content="false" :items="[{ label: 'プロフィール', value: 'profile', icon: 'i-lucide-id-card' }, { label: '注文履歴', value: 'orders', icon: 'i-lucide-receipt' }, { label: 'アクティビティ', value: 'activity', icon: 'i-lucide-activity' }]" class="mb-4" />

        <UCard v-if="tab === 'profile'">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="氏名"><UInput v-model="form.name" class="w-full" /></UFormField>
            <UFormField label="メールアドレス"><UInput v-model="form.email" class="w-full" /></UFormField>
            <UFormField label="ロール"><USelect v-model="form.role" :items="ROLES.map(r => ({ label: r.name, value: r.id as string }))" class="w-full" /></UFormField>
            <UFormField label="言語"><USelect :model-value="'ja'" :items="[{ label: '日本語', value: 'ja' }, { label: 'English', value: 'en' }]" class="w-full" /></UFormField>
            <UFormField label="メモ" class="col-span-2"><UTextarea placeholder="社内向けメモ" class="w-full" :rows="3" /></UFormField>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="neutral" variant="ghost" label="リセット" />
              <UButton label="保存" @click="toast.add({ title: '保存しました', icon: 'i-lucide-check' })" />
            </div>
          </template>
        </UCard>

        <UCard v-else-if="tab === 'orders'" :ui="{ body: 'p-0 sm:p-0' }">
          <ul class="divide-y divide-default">
            <li v-for="o in orders" :key="o.id" class="flex items-center gap-4 px-4 py-3 text-sm">
              <span class="font-mono text-xs">{{ o.id }}</span>
              <span class="text-muted text-xs">{{ fmtDate(o.createdAt) }}</span>
              <UBadge :color="ORDER_STATUS[o.status].color" variant="subtle" class="ml-auto">{{ ORDER_STATUS[o.status].label }}</UBadge>
              <span class="w-24 text-right tabular-nums">{{ yen(o.total) }}</span>
            </li>
          </ul>
        </UCard>

        <UCard v-else>
          <ol class="relative border-s border-default ms-2 space-y-5">
            <li v-for="l in logs" :key="l.id" class="ms-5">
              <span class="absolute -start-1.5 mt-1.5 size-3 rounded-full border-2 border-(--ui-bg) bg-(--ui-border-accented)" />
              <p class="text-sm"><code class="text-primary">{{ l.action }}</code> <span class="text-muted">{{ l.target }}</span></p>
              <p class="text-xs text-dimmed">{{ fmtDate(l.at) }} · {{ l.ip }}</p>
            </li>
          </ol>
        </UCard>
      </div>
    </div>

    <ConfirmDanger
      v-model:open="confirmOpen"
      :title="`${user.name} を利用停止しますか？`"
      description="停止中はログインできなくなります。"
      :confirm-word="current === 'prod' ? user.email : undefined"
      @confirm="toast.add({ title: '利用停止しました', color: 'error' })"
    />
  </PageShell>
</template>
