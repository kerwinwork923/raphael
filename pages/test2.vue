<template>
    <div>
      <h1>計數器：{{ counter.count }}</h1>
      <h2>雙倍計數：{{ counter.doubleCount }}</h2>
      <button @click="counter.increment">增加</button>
    </div>
  </template>
  
  <script setup>
  import { useCounterStore } from '~/stores/counter'
  
  // 使用 Pinia 商店
  const counter = useCounterStore()
  </script>
  