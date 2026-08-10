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
  /** classic | light | spotlight | banner | minimal | aurora | stage */
  hostedTheme?: string | null
  /** When false, logo is hidden on hosted page even if logo URL is set */
  hostedShowLogo?: boolean | null
  /** Announcement page logo (not the website widget logo) */
  hostedLogoUrl?: string | null
  /** Announcement page background image */
  hostedBackgroundImageUrl?: string | null
  messageContent: string
  defaultBgColor: string
  defaultTextColor: string
  defaultFont: string
  widgetConfig: WidgetConfigJson
  /** Built-in showcase page — no live SMS polling */
  isStaticDemo?: boolean
}
