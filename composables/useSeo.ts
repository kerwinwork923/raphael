import { useHead } from '#app'

interface SeoOptions {
  title?: string
  description?: string
  image?: string
  url?: string
}

export const useSeo = (options: SeoOptions) => {
  const { title, description, image, url } = options

  const siteName = '拉斐爾人本診所'
  const brandKeywords = 'NeuroPlus｜neuro-plus｜神經調節'
  const fullSiteName = `${siteName} ${brandKeywords}`

  const defaultDescription =
    '拉斐爾人本診所（NeuroPlus／neuro-plus）專注於神經調節與身心整合，提供專業評估與個人化健康照護，協助改善自律神經與身心平衡。'

  useHead({
    title: title ? `${title} - ${siteName}` : fullSiteName,
    meta: [
      {
        name: 'description',
        content: description || defaultDescription
      },
      {
        property: 'og:title',
        content: title ? `${title} - ${siteName}` : fullSiteName
      },
      {
        property: 'og:description',
        content: description || defaultDescription
      },
      {
        property: 'og:image',
        content: image || '/screenshot1.png'
      },
      {
        property: 'og:url',
        content: url || 'https://raphael.clinic'
      }
    ]
  })
}
