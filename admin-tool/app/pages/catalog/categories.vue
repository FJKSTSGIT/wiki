<script setup lang="ts">
import type { TreeItem } from '@nuxt/ui'
const tree = computed<TreeItem[]>(() => CATEGORIES.filter(c => !c.parent).map(p => ({
  label: p.name, icon: 'i-lucide-folder', defaultExpanded: true, value: p.id,
  children: CATEGORIES.filter(c => c.parent === p.id).map(c => ({ label: c.name, icon: 'i-lucide-folder-open', value: c.id }))
})))
const selected = ref<TreeItem>()
const cat = computed(() => CATEGORIES.find(c => c.id === (selected.value?.value ?? 1))!)
</script>

<template>
  <PageShell id="categories" title="カテゴリ" icon="i-lucide-folder-tree" description="親子構造のカテゴリ管理">
    <template #actions>
      <UButton icon="i-lucide-plus" size="sm" label="カテゴリ追加" />
    </template>
    <div class="grid grid-cols-[320px_1fr] gap-6">
      <UCard>
        <UTree v-model="selected" :items="tree" />
      </UCard>
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <p class="font-medium text-highlighted">{{ cat.name }}</p>
            <UBadge v-if="!cat.visible" color="neutral" variant="outline" size="sm">非表示</UBadge>
            <span class="ml-auto text-sm text-muted">{{ cat.products }} 商品</span>
          </div>
        </template>
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="名前"><UInput :model-value="cat.name" class="w-full" /></UFormField>
          <UFormField label="スラッグ"><UInput :model-value="cat.slug" class="w-full" icon="i-lucide-link" /></UFormField>
          <UFormField label="親カテゴリ"><USelect :model-value="cat.parent ?? 0" :items="[{ label: '(なし)', value: 0 }, ...CATEGORIES.filter(c => !c.parent).map(c => ({ label: c.name, value: c.id }))]" class="w-full" /></UFormField>
          <UFormField label="表示順"><UInputNumber :default-value="cat.id * 10" class="w-full" /></UFormField>
          <UFormField label="説明" class="col-span-2"><UTextarea :rows="3" class="w-full" /></UFormField>
          <USwitch :model-value="cat.visible" label="ストアに表示" />
        </div>
        <template #footer>
          <div class="flex justify-between">
            <UButton color="error" variant="ghost" icon="i-lucide-trash" label="削除" />
            <UButton label="保存" />
          </div>
        </template>
      </UCard>
    </div>
  </PageShell>
</template>
