export type WidgetConfigJson = {
  logoUrl?: string
  companyWebsiteLink?: string
  backgroundImageUrl?: string
  attachImage?: string
  youtubeUrl?: string
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
  /** When true and widget has companyWebsiteLink, show Visit website under footer */
  hostedShowWebsiteLink?: boolean | null
  /** Announcement page logo (not the website widget logo) */
  hostedLogoUrl?: string | null
  /** Announcement page background image */
  hostedBackgroundImageUrl?: string | null
  /** Optional image under the announcement message */
  hostedContentImageUrl?: string | null
  /** Optional YouTube link below the announcement card */
  hostedYoutubeUrl?: string | null
  messageContent: string
  defaultBgColor: string
  defaultTextColor: string
  defaultFont: string
  widgetConfig: WidgetConfigJson
  /** Built-in showcase page — no live SMS polling */
  isStaticDemo?: boolean
}
