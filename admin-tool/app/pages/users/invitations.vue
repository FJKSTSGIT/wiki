<script setup lang="ts">
const open = ref(false)
const email = ref('')
const role = ref('viewer')
const toast = useToast()
const list = ref([...INVITATIONS])
function send() {
  list.value.unshift({ email: email.value, role: role.value, invitedBy: '山田 太郎', sentAt: new Date(), expires: '残り7日' })
  toast.add({ title: '招待を送信しました', description: email.value, icon: 'i-lucide-send' })
  open.value = false; email.value = ''
}
</script>

<template>
  <PageShell id="invitations" title="招待" icon="i-lucide-mail-plus" description="保留中の招待">
    <template #actions>
      <UButton icon="i-lucide-user-plus" size="sm" label="新規招待" @click="open = true" />
    </template>
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <ul class="divide-y divide-default">
        <li v-for="i in list" :key="i.email" class="flex items-center gap-4 px-4 py-3 text-sm">
          <UIcon name="i-lucide-mail" class="size-5 text-dimmed" />
          <div class="min-w-0">
            <p class="text-highlighted">{{ i.email }}</p>
            <p class="text-xs text-muted">{{ roleName(i.role) }} · 招待者 {{ i.invitedBy }} · {{ fmtDate(i.sentAt) }}</p>
          </div>
          <UBadge color="warning" variant="subtle" class="ml-auto">{{ i.expires }}</UBadge>
          <UButton size="xs" color="neutral" variant="outline" icon="i-lucide-refresh-cw" label="再送" />
          <UButton size="xs" color="error" variant="ghost" icon="i-lucide-x" label="取消" @click="list = list.filter(x => x !== i)" />
        </li>
      </ul>
    </UCard>

    <UModal v-model:open="open" title="ユーザーを招待" description="招待メールは7日間有効です">
      <template #body>
        <div class="space-y-4">
          <UFormField label="メールアドレス" required><UInput v-model="email" type="email" class="w-full" placeholder="name@example.com" /></UFormField>
          <UFormField label="ロール"><USelect v-model="role" :items="ROLES.map(r => ({ label: r.name, value: r.id as string }))" class="w-full" /></UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="ghost" label="キャンセル" @click="open = false" />
          <UButton label="送信" icon="i-lucide-send" :disabled="!email.includes('@')" @click="send" />
        </div>
      </template>
    </UModal>
  </PageShell>
</template>
