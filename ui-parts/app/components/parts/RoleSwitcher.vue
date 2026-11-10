<script setup lang="ts">
/** ログインユーザーの役割を切り替える（確認・デモ用。本番では使わない） */
import { ROLES } from '~/utils/access'

withDefaults(defineProps<{ size?: 'sm' | 'md' }>(), { size: 'md' })
const { roleId, setRole } = useAccess()
const items = ROLES.map(r => ({ label: r.label, value: r.id, description: r.description }))
</script>

<template>
  <USelect
    :model-value="roleId"
    :items="items"
    icon="i-lucide-user-round-cog"
    :size="size"
    class="w-44"
    aria-label="ログインユーザーの役割"
    @update:model-value="(v: string) => setRole(v)"
  />
</template>
