<script setup lang="ts">
// 単系列の棒グラフ（凡例なし・タイトルで系列を示す）
const props = defineProps<{ data: { date: Date, count: number }[] }>()
const W = 640, H = 200, PAD = { l: 36, r: 8, t: 12, b: 24 }
const max = computed(() => Math.ceil(Math.max(...props.data.map(d => d.count)) / 100) * 100)
const ticks = computed(() => [0, max.value / 2, max.value])
const bw = computed(() => (W - PAD.l - PAD.r) / props.data.length)
const y = (v: number) => PAD.t + (H - PAD.t - PAD.b) * (1 - v / max.value)
const hover = ref<number | null>(null)
const bar = (v: number, i: number) => {
  const x = PAD.l + i * bw.value + 1, w = bw.value - 2, top = y(v), base = y(0), rr = Math.min(4, w / 2)
  return `M${x},${base}V${top + rr}Q${x},${top} ${x + rr},${top}H${x + w - rr}Q${x + w},${top} ${x + w},${top + rr}V${base}Z`
}
</script>

<template>
  <div class="relative">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto" role="img" aria-label="直近14日の注文数">
      <g class="text-[10px]" fill="currentColor">
        <template v-for="t in ticks" :key="t">
          <line :x1="PAD.l" :x2="W - PAD.r" :y1="y(t)" :y2="y(t)" class="stroke-(--ui-border)" stroke-width="1" />
          <text :x="PAD.l - 6" :y="y(t) + 3" text-anchor="end" class="fill-(--ui-text-dimmed)">{{ t }}</text>
        </template>
      </g>
      <g>
        <path
          v-for="(d, i) in data" :key="i" :d="bar(d.count, i)"
          class="fill-primary transition-opacity" :class="hover !== null && hover !== i && 'opacity-40'"
        />
        <text
          v-for="(d, i) in data" :key="'l' + i" :x="PAD.l + i * bw + bw / 2" :y="H - 8"
          text-anchor="middle" class="text-[10px] fill-(--ui-text-dimmed)"
        >{{ i % 2 === 1 ? fmtDay(d.date) : '' }}</text>
        <rect
          v-for="(d, i) in data" :key="'h' + i" :x="PAD.l + i * bw" :y="PAD.t" :width="bw" :height="H - PAD.t - PAD.b"
          fill="transparent" @mouseenter="hover = i" @mouseleave="hover = null"
        />
      </g>
    </svg>
    <div
      v-if="hover !== null"
      class="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border border-default bg-elevated px-2 py-1 text-xs shadow"
      :style="{ left: `${((PAD.l + hover * bw + bw / 2) / W) * 100}%`, top: `${(y(data[hover]!.count) / H) * 100}%` }"
    >
      <p class="text-muted">{{ fmtDay(data[hover]!.date) }}</p>
      <p class="font-semibold text-highlighted">{{ data[hover]!.count }} 件</p>
    </div>
  </div>
</template>
