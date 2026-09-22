/**
 * 风格预设名称/描述的本地化显示
 *
 * 预设的 name/description 存在后端 DB（种子为中文），是按 value 内容寻址的，
 * 不能随语言改写——否则用户改过的行会被当成种子覆盖。
 * 因此按 value 查 i18n 表覆盖显示；查不到时回退 DB 原文
 * （用户自建预设、或新增语言尚未补齐翻译时都走这条）。
 */
import { useI18n } from 'vue-i18n'
import { i18n } from '~/composables/i18n'

interface StylePresetLike {
  value?: string | null
  name?: string | null
  description?: string | null
}

export function useStylePresetLabel() {
  const { t, te } = useI18n()

  /** value → 翻译后的名称；无翻译回退 DB name */
  function styleName(preset: StylePresetLike | null | undefined): string {
    const value = preset?.value
    if (value && te(`settings.stylePresetNames.${value}.name`)) {
      return t(`settings.stylePresetNames.${value}.name`)
    }
    return preset?.name || value || ''
  }

  /** value → 翻译后的描述；无翻译回退 DB description */
  function styleDescription(preset: StylePresetLike | null | undefined): string {
    const value = preset?.value
    if (value && te(`settings.stylePresetNames.${value}.description`)) {
      return t(`settings.stylePresetNames.${value}.description`)
    }
    return preset?.description || ''
  }

  /** 按 value 查（用于只知道 key 的场景，如项目卡片的 style 标签） */
  function styleNameByValue(value: string | null | undefined, fallback?: string): string {
    if (value && te(`settings.stylePresetNames.${value}.name`)) {
      return t(`settings.stylePresetNames.${value}.name`)
    }
    return fallback || value || ''
  }

  /**
   * 同上，但仅在 DB 值仍是「种子原文」时才翻译。
   * 设置页编辑表单用（用户改过名就不该再被译文盖掉）。
   * 种子原文取 zh 文案 —— DB 种子本就是中文写入的。
   */
  function styleNameIfSeed(preset: StylePresetLike | null | undefined): string {
    const value = preset?.value
    const seedName = value ? seedText(value, 'name') : ''
    if (value && seedName && preset?.name === seedName) {
      return styleName(preset)
    }
    return preset?.name || ''
  }

  function styleDescriptionIfSeed(preset: StylePresetLike | null | undefined): string {
    const value = preset?.value
    const seedDesc = value ? seedText(value, 'description') : ''
    if (value && seedDesc && preset?.description === seedDesc) {
      return styleDescription(preset)
    }
    return preset?.description || ''
  }

  /** 读 zh 语言包下的种子原文（不随当前界面语言变化） */
  function seedText(value: string, field: 'name' | 'description'): string {
    const msg = (i18n.global.getLocaleMessage('zh') as any)?.settings?.stylePresetNames?.[value]?.[field]
    return typeof msg === 'string' ? msg : ''
  }

  return { styleName, styleDescription, styleNameByValue, styleNameIfSeed, styleDescriptionIfSeed }
}
