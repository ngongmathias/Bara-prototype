import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "npm:@react-email/components@1.0.7";
import * as React from "npm:react@18.3.1";

interface MonthlyAnalyticsEmailProps {
    userFirstname?: string;
    monthName?: string;
    totalXP?: number;
    xpChange?: number;
    totalCoins?: number;
    coinsChange?: number;
    currentLevel?: number;
    levelProgress?: number;
    prestigeTier?: string;
    totalMissionsCompleted?: number;
    totalAchievements?: number;
    longestStreak?: number;
    eventsAttended?: number;
    listingsPosted?: number;
    reviewsWritten?: number;
    songsPlayed?: number;
    predictionsWon?: number;
    predictionsLost?: number;
    referralCount?: number;
    topAchievementTitle?: string;
}

const baseUrl = "https://baraafrika.com";

export const MonthlyAnalyticsEmail = ({
    userFirstname = "Explorer",
    monthName = "This Month",
    totalXP = 0,
    xpChange = 0,
    totalCoins = 0,
    coinsChange = 0,
    currentLevel = 1,
    levelProgress = 0,
    prestigeTier = "Bronze",
    totalMissionsCompleted = 0,
    totalAchievements = 0,
    longestStreak = 0,
    eventsAttended = 0,
    listingsPosted = 0,
    reviewsWritten = 0,
    songsPlayed = 0,
    predictionsWon = 0,
    predictionsLost = 0,
    referralCount = 0,
    topAchievementTitle = "",
}: MonthlyAnalyticsEmailProps) => (
    <Html>
        <Head />
        <Preview>Your {monthName} analytics report on Bara Afrika</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />

                <Section style={headerBanner}>
                    <Text style={reportLabel}>MONTHLY ANALYTICS REPORT</Text>
                    <Heading style={h1}>{monthName}</Heading>
                    <Text style={headerSub}>Your personal performance summary</Text>
                </Section>

                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Here's your detailed analytics report for {monthName}. See how you've grown
                    and what you've accomplished on Bara Afrika!
                </Text>

                {/* Profile Summary */}
                <Section style={profileCard}>
                    <Text style={profileTitle}>Your Profile</Text>
                    <Section style={profileGrid}>
                        <Text style={profileStat}>
                            🏅 <strong>Level {currentLevel}</strong> · {prestigeTier}
                        </Text>
                        <Text style={profileStat}>
                            📊 {levelProgress}% to next level
                        </Text>
                    </Section>
                </Section>

                {/* Main Stats */}
                <Text style={sectionHeading}>📈 Month at a Glance</Text>
                <Section style={statsGrid}>
                    <Section style={statBox}>
                        <Text style={statIcon}>⚡</Text>
                        <Text style={statNum}>{totalXP.toLocaleString()}</Text>
                        <Text style={statName}>Total XP</Text>
                        <Text style={xpChange >= 0 ? statChangeUp : statChangeDown}>
                            {xpChange >= 0 ? '↑' : '↓'} {Math.abs(xpChange)} this month
                        </Text>
                    </Section>
                    <Section style={statBox}>
                        <Text style={statIcon}>🪙</Text>
                        <Text style={statNum}>{totalCoins.toLocaleString()}</Text>
                        <Text style={statName}>Bara Coins</Text>
                        <Text style={coinsChange >= 0 ? statChangeUp : statChangeDown}>
                            {coinsChange >= 0 ? '↑' : '↓'} {Math.abs(coinsChange)} this month
                        </Text>
                    </Section>
                    <Section style={statBox}>
                        <Text style={statIcon}>🔥</Text>
                        <Text style={statNum}>{longestStreak}</Text>
                        <Text style={statName}>Best Streak</Text>
                        <Text style={statChangeMuted}>days this month</Text>
                    </Section>
                    <Section style={statBox}>
                        <Text style={statIcon}>🎯</Text>
                        <Text style={statNum}>{totalMissionsCompleted}</Text>
                        <Text style={statName}>Missions Done</Text>
                        <Text style={statChangeMuted}>completed</Text>
                    </Section>
                </Section>

                {/* Activity Breakdown */}
                <Text style={sectionHeading}>🎮 Activity Breakdown</Text>
                <Section style={activityCard}>
                    {eventsAttended > 0 && (
                        <Text style={activityRow}>📅 Attended <strong>{eventsAttended}</strong> event{eventsAttended !== 1 ? 's' : ''}</Text>
                    )}
                    {listingsPosted > 0 && (
                        <Text style={activityRow}>🛍️ Posted <strong>{listingsPosted}</strong> marketplace listing{listingsPosted !== 1 ? 's' : ''}</Text>
                    )}
                    {reviewsWritten > 0 && (
                        <Text style={activityRow}>⭐ Wrote <strong>{reviewsWritten}</strong> review{reviewsWritten !== 1 ? 's' : ''}</Text>
                    )}
                    {songsPlayed > 0 && (
                        <Text style={activityRow}>🎵 Played <strong>{songsPlayed}</strong> song{songsPlayed !== 1 ? 's' : ''} on Streams</Text>
                    )}
                    {(predictionsWon > 0 || predictionsLost > 0) && (
                        <Text style={activityRow}>⚽ Sports predictions: <strong>{predictionsWon}W</strong> / <strong>{predictionsLost}L</strong></Text>
                    )}
                    {referralCount > 0 && (
                        <Text style={activityRow}>👥 Referred <strong>{referralCount}</strong> new user{referralCount !== 1 ? 's' : ''}</Text>
                    )}
                    {totalAchievements > 0 && (
                        <Text style={activityRow}>🏆 Unlocked <strong>{totalAchievements}</strong> achievement{totalAchievements !== 1 ? 's' : ''}</Text>
                    )}
                    {eventsAttended === 0 && listingsPosted === 0 && reviewsWritten === 0 && songsPlayed === 0 && (
                        <Text style={activityRow}>No activity recorded this month. Get started by exploring the platform!</Text>
                    )}
                </Section>

                {/* Top Achievement */}
                {topAchievementTitle && (
                    <Section style={achievementHighlight}>
                        <Text style={achievementIcon}>🏆</Text>
                        <Text style={achievementLabel}>TOP ACHIEVEMENT</Text>
                        <Text style={achievementName}>{topAchievementTitle}</Text>
                    </Section>
                )}

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard`}>
                        View Full Dashboard
                    </Link>
                </Section>

                <Section style={ctaRow}>
                    <Link style={ctaLink} href={`${baseUrl}/leaderboard`}>📊 Leaderboard</Link>
                    <Text style={ctaSep}> · </Text>
                    <Link style={ctaLink} href={`${baseUrl}/store`}>🪙 Coin Store</Link>
                    <Text style={ctaSep}> · </Text>
                    <Link style={ctaLink} href={`${baseUrl}/invite`}>👥 Invite Friends</Link>
                </Section>

                <Text style={footer}>
                    &copy; 2026 Bara Afrika. All rights reserved.
                    <br />
                    <Link href={`${baseUrl}/users/dashboard/settings`} style={{ color: "#8898aa" }}>
                        Email Preferences
                    </Link>
                    {" · "}
                    <Link href={`${baseUrl}/contact-us`} style={{ color: "#8898aa" }}>
                        Contact Us
                    </Link>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default MonthlyAnalyticsEmail;

const main = {
    backgroundColor: "#ffffff",
    fontFamily: '"Comfortaa", "Helvetica Neue", Helvetica, Arial, sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "560px",
};

const logo = {
    margin: "0 auto",
    marginBottom: "24px",
};

const headerBanner = {
    textAlign: "center" as const,
    backgroundColor: "#000000",
    borderRadius: "12px",
    padding: "28px 24px",
    marginBottom: "24px",
};

const reportLabel = {
    fontSize: "10px",
    fontWeight: "bold" as const,
    letterSpacing: "0.2em",
    color: "#FFD700",
    textAlign: "center" as const,
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
};

const h1 = {
    fontSize: "28px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "0 0 6px",
    color: "#ffffff",
};

const headerSub = {
    fontSize: "13px",
    color: "#9ca3af",
    textAlign: "center" as const,
    margin: "0",
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginBottom: "20px",
};

const profileCard = {
    backgroundColor: "#f3f4f6",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "24px",
};

const profileTitle = {
    fontSize: "13px",
    fontWeight: "bold" as const,
    color: "#6b7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 8px",
};

const profileGrid = {
    padding: "0",
};

const profileStat = {
    fontSize: "14px",
    color: "#374151",
    margin: "4px 0",
};

const sectionHeading = {
    fontSize: "14px",
    fontWeight: "bold" as const,
    color: "#111827",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "24px 0 12px",
};

const statsGrid = {
    display: "flex",
    gap: "10px",
    marginBottom: "24px",
};

const statBox = {
    flex: "1",
    backgroundColor: "#fafafa",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "14px 8px",
    textAlign: "center" as const,
};

const statIcon = {
    fontSize: "22px",
    margin: "0 0 4px",
    textAlign: "center" as const,
    lineHeight: "1",
};

const statNum = {
    fontSize: "22px",
    fontWeight: "bold" as const,
    color: "#111827",
    margin: "0 0 2px",
    textAlign: "center" as const,
};

const statName = {
    fontSize: "11px",
    color: "#6b7280",
    margin: "0 0 4px",
    textAlign: "center" as const,
};

const statChangeUp = {
    fontSize: "10px",
    color: "#16a34a",
    fontWeight: "bold" as const,
    margin: "0",
    textAlign: "center" as const,
};

const statChangeDown = {
    fontSize: "10px",
    color: "#dc2626",
    fontWeight: "bold" as const,
    margin: "0",
    textAlign: "center" as const,
};

const statChangeMuted = {
    fontSize: "10px",
    color: "#9ca3af",
    margin: "0",
    textAlign: "center" as const,
};

const activityCard = {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "24px",
};

const activityRow = {
    fontSize: "14px",
    color: "#14532d",
    margin: "6px 0",
    lineHeight: "20px",
};

const achievementHighlight = {
    backgroundColor: "#fffbeb",
    border: "2px solid #f59e0b",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    textAlign: "center" as const,
};

const achievementIcon = {
    fontSize: "36px",
    margin: "0",
    textAlign: "center" as const,
    lineHeight: "1",
};

const achievementLabel = {
    fontSize: "10px",
    fontWeight: "bold" as const,
    letterSpacing: "0.15em",
    color: "#d97706",
    margin: "8px 0 4px",
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
};

const achievementName = {
    fontSize: "16px",
    fontWeight: "bold" as const,
    color: "#92400e",
    margin: "0",
    textAlign: "center" as const,
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "24px",
};

const button = {
    backgroundColor: "#000000",
    borderRadius: "100px",
    color: "#FFD700",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
    fontWeight: "bold",
};

const ctaRow = {
    textAlign: "center" as const,
    marginBottom: "24px",
};

const ctaLink = {
    fontSize: "13px",
    color: "#2563eb",
    fontWeight: "bold" as const,
    textDecoration: "none",
};

const ctaSep = {
    display: "inline",
    color: "#d1d5db",
    fontSize: "13px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
};
