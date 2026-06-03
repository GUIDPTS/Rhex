import type { Metadata } from "next"
import { Suspense, type CSSProperties } from "react"

import { BackToTopButton } from "@/components/back-to-top-button"
import { ConditionalSiteFooter } from "@/components/conditional-site-footer"
import { CurrentUserInboxProvider, CurrentUserProvider } from "@/components/current-user-provider"
import { GlobalNavigationProgress } from "@/components/global-navigation-progress"
import { RootBootstrap } from "@/components/root-bootstrap"
import { SiteFooter } from "@/components/site-footer"
import { SiteSettingsProvider } from "@/components/site-settings-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { DeferredToaster } from "@/components/deferred-toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GlobalLayoutAddonSlots } from "@/addons-host/client/global-layout-addon-slots"
import { AddonRuntimeProvider } from "@/addons-host/client/addon-runtime-provider"
import { RhexGlobalSdkBootstrap } from "@/addons-host/client/rhex-global-sdk"
import {
  listAddonEditorProviderDescriptors,
  listAddonEditorToolbarItemDescriptors,
} from "@/lib/addon-editor-providers"
import { listAddonSurfaceOverrideDescriptors } from "@/lib/addon-surface-overrides"


import { resolveSiteIconPath } from "@/lib/site-branding"
import { getConfiguredSiteOrigin } from "@/lib/site-origin"
import { getSidebarNavigationDisplayModeAttribute } from "@/lib/sidebar-navigation-preference"
import { getPublishedCustomPageFooterHiddenPaths } from "@/lib/custom-pages"
import { getSiteSettings } from "@/lib/site-settings"
import { buildVipNameColorStyleVariables } from "@/lib/vip-name-colors"





import "./globals.css"
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const noScriptRootInitStyles = `
  html[data-root-init="pending"] {
    overflow: auto;
  }

  html[data-root-init="pending"] body {
    visibility: visible;
    overflow: visible;
  }

  html[data-root-init="pending"]::before,
  html[data-root-init="pending"]::after {
    display: none;
  }
`

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  const rssUrl = "/rss.xml"
  const configuredSiteOrigin = getConfiguredSiteOrigin()
  const resolvedSiteIconPath = resolveSiteIconPath(settings.siteIconPath)
  const supportsAppleIcon = !/\.svg(?:$|[?#])/i.test(resolvedSiteIconPath)

  return {
    ...(configuredSiteOrigin ? { metadataBase: new URL(configuredSiteOrigin) } : {}),
    title: `${settings.siteName} - ${settings.siteSlogan}`,
    description: settings.siteDescription,
    keywords: settings.siteSeoKeywords,
    icons: supportsAppleIcon
      ? {
          icon: resolvedSiteIconPath,
          shortcut: resolvedSiteIconPath,
          apple: resolvedSiteIconPath,
        }
      : {
          icon: resolvedSiteIconPath,
          shortcut: resolvedSiteIconPath,
        },
    alternates: {
      types: {
        "application/rss+xml": rssUrl,
      },
    },
  }
}



export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, editorProviders, editorToolbarItems, addonSurfaceOverrides, footerHiddenPaths] = await Promise.all([
    getSiteSettings(),
    listAddonEditorProviderDescriptors(),
    listAddonEditorToolbarItemDescriptors(),
    listAddonSurfaceOverrideDescriptors(),
    getPublishedCustomPageFooterHiddenPaths(),
  ])
  const vipNameColorStyle = buildVipNameColorStyleVariables(settings.vipNameColors) as CSSProperties
  const sidebarDisplayMode = getSidebarNavigationDisplayModeAttribute(settings.leftSidebarDisplayMode)
  const themeRuntime = settings.theme
  const rhexSession = {
    isAuthenticated: false,
    user: null,
  }
  const rhexSite = settings

  return (

    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn("font-sans", geist.variable)}
      data-root-init="pending"
      data-sidebar-display-mode={sidebarDisplayMode}
      data-theme-preset={themeRuntime.preset}
      data-font-size-preset={themeRuntime.fontSizePreset}
    >
      <head>
        <noscript>
          <style>{noScriptRootInitStyles}</style>
        </noscript>
      </head>
      <body style={vipNameColorStyle}>
        <RhexGlobalSdkBootstrap session={rhexSession} site={rhexSite} />
        <RootBootstrap />
        <Suspense fallback={null}>
          <GlobalLayoutAddonSlots />
        </Suspense>
        <ThemeProvider settings={themeRuntime}>
          <CurrentUserProvider>
            <CurrentUserInboxProvider messageEnabled={settings.messageEnabled} messagePromptAudioPath={settings.messagePromptAudioPath}>
            <SiteSettingsProvider
              markdownEmojiMap={settings.markdownEmojiMap}
              markdownImageUploadEnabled={settings.markdownImageUploadEnabled}
              leftSidebarDisplayMode={settings.leftSidebarDisplayMode}
              leftSidebarNavigationMode={settings.leftSidebarNavigationMode}
              leftSidebarHome={settings.leftSidebarHome}
              vipLevelIcons={settings.vipLevelIcons}
            >
              <AddonRuntimeProvider editorProviders={editorProviders} editorToolbarItems={editorToolbarItems} surfaceOverrides={addonSurfaceOverrides}>
                <TooltipProvider>
                  <Suspense fallback={null}>
                    <GlobalNavigationProgress />
                  </Suspense>
                  {children}
                  <ConditionalSiteFooter hiddenPaths={footerHiddenPaths}>
                    <>
                      <SiteFooter />
                    </>
                  </ConditionalSiteFooter>
                  <BackToTopButton />
                  <DeferredToaster />
                </TooltipProvider>
              </AddonRuntimeProvider>
            </SiteSettingsProvider>
            </CurrentUserInboxProvider>
          </CurrentUserProvider>
        </ThemeProvider>




      </body>

    </html>
  )
}
