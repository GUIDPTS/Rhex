"use client"

import { useCurrentUser } from "@/components/current-user-provider"
import { SidebarUserCard, type SidebarUserCardData } from "@/components/user/sidebar-user-card"
import type { SiteSettingsData } from "@/lib/site-settings.types"
import { getVipLevel, isVipActive } from "@/lib/vip-status"

interface HomeSidebarCurrentUserCardProps {
  createPostHref?: string
  settings: Pick<
    SiteSettingsData,
    | "siteName"
    | "siteDescription"
    | "siteLogoPath"
    | "siteIconPath"
    | "pointName"
    | "checkInEnabled"
    | "checkInReward"
    | "checkInRewardText"
    | "checkInVip1Reward"
    | "checkInVip1RewardText"
    | "checkInVip2Reward"
    | "checkInVip2RewardText"
    | "checkInVip3Reward"
    | "checkInVip3RewardText"
    | "checkInMakeUpEnabled"
    | "checkInMakeUpCardPrice"
    | "checkInVipMakeUpCardPrice"
    | "checkInVip1MakeUpCardPrice"
    | "checkInVip2MakeUpCardPrice"
    | "checkInVip3MakeUpCardPrice"
    | "checkInMakeUpCountsTowardStreak"
    | "checkInMakeUpOldestDayLimit"
  >
}

function resolveCheckInReward(user: NonNullable<ReturnType<typeof useCurrentUser>["user"]>, settings: HomeSidebarCurrentUserCardProps["settings"]) {
  if (!isVipActive(user)) {
    return {
      reward: settings.checkInReward,
      rewardText: settings.checkInRewardText,
    }
  }

  const vipLevel = getVipLevel(user)
  if (vipLevel >= 3) {
    return {
      reward: settings.checkInVip3Reward,
      rewardText: settings.checkInVip3RewardText,
    }
  }

  if (vipLevel === 2) {
    return {
      reward: settings.checkInVip2Reward,
      rewardText: settings.checkInVip2RewardText,
    }
  }

  return {
    reward: settings.checkInVip1Reward,
    rewardText: settings.checkInVip1RewardText,
  }
}

export function HomeSidebarCurrentUserCard({ createPostHref, settings }: HomeSidebarCurrentUserCardProps) {
  const { user, surface } = useCurrentUser()
  const reward = user ? resolveCheckInReward(user, settings) : null
  const sidebarUser: SidebarUserCardData | null = user
    ? {
        username: user.username,
        nickname: user.nickname,
        displayName: user.displayName,
        avatarPath: user.avatarPath,
        role: user.role === "ADMIN" || user.role === "MODERATOR" ? user.role : "USER",
        roleBadge: user.roleBadge,
        status: user.status === "ACTIVE" || user.status === "MUTED" || user.status === "BANNED" || user.status === "INACTIVE" ? user.status : "ACTIVE",
        level: Math.max(1, user.levelBadgeLevel ?? user.level ?? 1),
        levelName: user.levelName ?? undefined,
        levelColor: user.levelColor ?? undefined,
        levelIcon: user.levelIcon ?? undefined,
        vipLevel: user.vipLevel ?? 0,
        vipExpiresAt: user.vipExpiresAt,
        boardCount: surface?.boardCount ?? 0,
        favoriteCount: surface?.favoriteCount ?? 0,
        followerCount: surface?.followerCount ?? 0,
        postCount: surface?.postCount ?? 0,
        receivedLikeCount: surface?.receivedLikeCount ?? 0,
        points: surface?.points ?? user.points ?? 0,
        pointName: settings.pointName,
        checkInEnabled: settings.checkInEnabled,
        checkInReward: reward?.reward,
        checkInRewardText: reward?.rewardText,
        checkInMakeUpEnabled: settings.checkInMakeUpEnabled,
        checkInMakeUpCardPrice: settings.checkInMakeUpCardPrice,
        checkInVipMakeUpCardPrice: settings.checkInVipMakeUpCardPrice,
        checkInVip1MakeUpCardPrice: settings.checkInVip1MakeUpCardPrice,
        checkInVip2MakeUpCardPrice: settings.checkInVip2MakeUpCardPrice,
        checkInVip3MakeUpCardPrice: settings.checkInVip3MakeUpCardPrice,
        checkInMakeUpCountsTowardStreak: settings.checkInMakeUpCountsTowardStreak,
        checkInMakeUpOldestDayLimit: settings.checkInMakeUpOldestDayLimit,
        checkedInToday: surface?.checkedInToday ?? false,
        currentCheckInStreak: surface?.currentCheckInStreak ?? 0,
        maxCheckInStreak: surface?.maxCheckInStreak ?? 0,
      }
    : null

  return (
    <SidebarUserCard
      user={sidebarUser}
      createPostHref={createPostHref}
      siteName={settings.siteName}
      siteDescription={settings.siteDescription}
      siteLogoPath={settings.siteLogoPath}
      siteIconPath={settings.siteIconPath}
    />
  )
}
