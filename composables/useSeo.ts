import { useHead } from '#app'

interface SeoOptions {
  title?: string
  description?: string
  image?: string
  url?: string
}

export const useSeo = (options: SeoOptions) => {
  const { title, description, image, url } = options

  useHead({
    title: title ? `${title} - NeuroPlus神經調節家` : 'NeuroPlus神經調節家',
    meta: [
      {
        name: 'description',
        content: description || 'NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據。'
      },
      {
        property: 'og:title',
        content: title ? `${title} - NeuroPlus神經調節家` : 'NeuroPlus神經調節家'
      },
      {
        property: 'og:description',
        content: description || 'NeuroPlus神經調節家提供專業的自律神經檢測服務，運用FDA認證AI技術，透過人臉辨識快速分析HRV數據。'
      },
      {
        property: 'og:image',
        content: image || '/screenshot1.png'
      },
      {
        property: 'og:url',
        content: url || 'https://neuroplus.com.tw'
      }
    ]
  })
} 