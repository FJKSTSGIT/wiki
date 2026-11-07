<script setup lang="ts">
/** 一覧などで使う権限の要約表示（テンプレート名 + 件数 / カスタム表示） */
import type { AdminUser } from '~/types'
import { ALL_PERMISSIONS } from '~/utils/permissions'

const props = defineProps<{ user: Pick<AdminUser, 'permissions' | 'templateId'> }>()

const template = computed(() => findTemplate(props.user.templateId))
const custom = computed(() => !matchesTemplate(props.user.permissions, props.user.templateId))
</script>

<template>
  <div class="flex items-center gap-1.5">
    <UBadge
      :label="template?.label ?? '未設定'"
      :color="template?.color ?? 'neutral'"
      variant="soft"
    />
    <UTooltip v-if="custom" text="テンプレートから個別に変更されています">
      <UBadge label="カスタム" color="warning" variant="outline" size="sm" />
    </UTooltip>
    <span class="text-xs text-muted tabular-nums">{{ user.permissions.length }}/{{ ALL_PERMISSIONS.length }}</span>
  </div>
</template>
