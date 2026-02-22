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

interface WeeklyDigestEmailProps {
    userFirstname?: string;
    weekOf?: string;
    xpEarned?: number;
    coinsEarned?: number;
    currentLevel?: number;
    currentStreak?: number;
    missionsCompleted?: number;
    totalMissions?: number;
    achievementsUnlocked?: number;
    topEventTitle?: string;
    topEventDate?: string;
    topEventId?: string;
    newListingsCount?: number;
    leaderboardRank?: number;
}

const baseUrl = "https://baraafrika.com";

export const WeeklyDigestEmail = ({
    userFirstname = "Explorer",
    weekOf = "this week",
    xpEarned = 0,
    coinsEarned = 0,
    currentLevel = 1,
    currentStreak = 0,
    missionsCompleted = 0,
    totalMissions = 0,
    achievementsUnlocked = 0,
    topEventTitle = "",
    topEventDate = "",
    topEventId = "",
    newListingsCount = 0,
    leaderboardRank = 0,
}: WeeklyDigestEmailProps) => (
    <Html>
        <Head />
        <Preview>Your Bara Afrika weekly summary — {weekOf}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />

                <Section style={headerSection}>
                    <Text style={weekLabel}>WEEKLY DIGEST</Text>
                    <Heading style={h1}>Your week on Bara Afrika</Heading>
                    <Text style={weekSubtitle}>{weekOf}</Text>
                </Section>

                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Here's a summary of your activity and what's happening on the platform this week.
                    Keep up the great work!
                </Text>

                {/* Stats Grid */}
                <Section style={statsGrid}>
                    <Section style={statCard}>
                        <Text style={statEmoji}>⚡</Text>
                        <Text style={statValue}>{xpEarned > 0 ? `+${xpEarned}` : "0"}</Text>
                        <Text style={statLabel}>XP Earned</Text>
                    </Section>
                    <Section style={statCard}>
                        <Text style={statEmoji}>🪙</Text>
                        <Text style={statValue}>{coinsEarned > 0 ? `+${coinsEarned}` : "0"}</Text>
                        <Text style={statLabel}>Coins Earned</Text>
                    </Section>
                    <Section style={statCard}>
                        <Text style={statEmoji}>🔥</Text>
                        <Text style={statValue}>{currentStreak}</Text>
                        <Text style={statLabel}>Day Streak</Text>
                    </Section>
                    <Section style={statCard}>
                        <Text style={statEmoji}>🎯</Text>
                        <Text style={statValue}>{missionsCompleted}/{totalMissions}</Text>
                        <Text style={statLabel}>Missions Done</Text>
                    </Section>
                </Section>

                {/* Level & Rank */}
                {(currentLevel > 0 || leaderboardRank > 0) && (
                    <Section style={highlightRow}>
                        {currentLevel > 0 && (
                            <Text style={highlightItem}>
                                🏅 <strong>Level {currentLevel}</strong>
                            </Text>
                        )}
                        {achievementsUnlocked > 0 && (
                            <Text style={highlightItem}>
                                🏆 <strong>{achievementsUnlocked} achievement{achievementsUnlocked !== 1 ? 's' : ''} unlocked</strong>
                            </Text>
                        )}
                        {leaderboardRank > 0 && (
                            <Text style={highlightItem}>
                                📊 <strong>Rank #{leaderboardRank}</strong> on leaderboard
                            </Text>
                        )}
                    </Section>
                )}

                {/* Featured Event */}
                {topEventTitle && (
                    <>
                        <Text style={sectionTitle}>📅 Upcoming Event</Text>
                        <Section style={eventCard}>
                            <Text style={eventName}>{topEventTitle}</Text>
                            {topEventDate && <Text style={eventDate}>{topEventDate}</Text>}
                            {topEventId && (
                                <Link style={eventLink} href={`${baseUrl}/events/${topEventId}`}>
                                    View Event →
                                </Link>
                            )}
                        </Section>
                    </>
                )}

                {/* New Marketplace Listings */}
                {newListingsCount > 0 && (
                    <Section style={marketplaceRow}>
                        <Text style={marketplaceText}>
                            🛍️ <strong>{newListingsCount} new listings</strong> added to the marketplace this week.
                        </Text>
                        <Link style={marketplaceLink} href={`${baseUrl}/marketplace`}>
                            Browse Marketplace →
                        </Link>
                    </Section>
                )}

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard`}>
                        Go to Your Dashboard
                    </Link>
                </Section>

                <Text style={tipText}>
                    💡 <strong>This week's tip:</strong> Complete all daily missions to earn bonus
                    XP multipliers. A full week of missions gives you a 2× XP boost!
                </Text>

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
                    {" · "}
                    <Link href={`${baseUrl}/leaderboard`} style={{ color: "#8898aa" }}>
                        Leaderboard
                    </Link>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WeeklyDigestEmail;

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

const headerSection = {
    textAlign: "center" as const,
    marginBottom: "24px",
    backgroundColor: "#000000",
    borderRadius: "12px",
    padding: "24px",
};

const weekLabel = {
    fontSize: "11px",
    fontWeight: "bold" as const,
    letterSpacing: "0.2em",
    color: "#FFD700",
    textAlign: "center" as const,
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
};

const h1 = {
    fontSize: "26px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "0 0 8px",
    padding: "0",
    color: "#ffffff",
};

const weekSubtitle = {
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

const statsGrid = {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
};

const statCard = {
    flex: "1",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "16px 8px",
    textAlign: "center" as const,
};

const statEmoji = {
    fontSize: "24px",
    margin: "0 0 4px",
    textAlign: "center" as const,
    lineHeight: "1",
};

const statValue = {
    fontSize: "20px",
    fontWeight: "bold" as const,
    color: "#111827",
    margin: "0 0 2px",
    textAlign: "center" as const,
};

const statLabel = {
    fontSize: "11px",
    color: "#6b7280",
    margin: "0",
    textAlign: "center" as const,
};

const highlightRow = {
    backgroundColor: "#fefce8",
    border: "1px solid #fde047",
    borderRadius: "10px",
    padding: "12px 16px",
    marginBottom: "24px",
};

const highlightItem = {
    fontSize: "14px",
    color: "#713f12",
    margin: "4px 0",
};

const sectionTitle = {
    fontSize: "14px",
    fontWeight: "bold" as const,
    color: "#374151",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 10px",
};

const eventCard = {
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "24px",
};

const eventName = {
    fontSize: "16px",
    fontWeight: "bold" as const,
    color: "#1e3a8a",
    margin: "0 0 6px",
};

const eventDate = {
    fontSize: "13px",
    color: "#3b82f6",
    margin: "0 0 10px",
};

const eventLink = {
    fontSize: "13px",
    color: "#2563eb",
    fontWeight: "bold" as const,
    textDecoration: "none",
};

const marketplaceRow = {
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "24px",
};

const marketplaceText = {
    fontSize: "14px",
    color: "#14532d",
    margin: "0 0 8px",
};

const marketplaceLink = {
    fontSize: "13px",
    color: "#16a34a",
    fontWeight: "bold" as const,
    textDecoration: "none",
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

const tipText = {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#555",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
};
