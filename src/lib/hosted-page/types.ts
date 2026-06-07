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
  messageContent: string
  defaultBgColor: string
  defaultTextColor: string
  defaultFont: string
  widgetConfig: WidgetConfigJson
}
