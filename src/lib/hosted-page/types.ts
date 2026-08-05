export type WidgetConfigJson = {
  logoUrl?: string
  companyWebsiteLink?: string
  backgroundImageUrl?: string
  attachImage?: string
  presetText?: string
  fontSize?: number
  mobileFontSize?: number
}

export type HostedPageData = {
  clientId: string
  name: string
  hostedSlug: string
  hostedIntroText: string | null
  hostedFooterText: string | null
  /** classic | light | spotlight | banner | minimal */
  hostedTheme?: string | null
  messageContent: string
  defaultBgColor: string
  defaultTextColor: string
  defaultFont: string
  widgetConfig: WidgetConfigJson
  /** Built-in showcase page — no live SMS polling */
  isStaticDemo?: boolean
}
