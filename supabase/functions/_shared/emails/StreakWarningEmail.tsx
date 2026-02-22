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

interface StreakWarningEmailProps {
    userFirstname?: string;
    currentStreak?: number;
    lastActivityDate?: string;
}

const baseUrl = "https://baraafrika.com";

export const StreakWarningEmail = ({
    userFirstname = "Explorer",
    currentStreak = 1,
    lastActivityDate = "yesterday",
}: StreakWarningEmailProps) => (
    <Html>
        <Head />
        <Preview>🔥 Don't break your {currentStreak}-day streak on Bara Afrika!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />

                <Section style={warningSection}>
                    <Text style={flameEmoji}>🔥</Text>
                    <Text style={warningLabel}>STREAK AT RISK</Text>
                </Section>

                <Heading style={h1}>Your streak is about to end!</Heading>

                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    You're on a <strong>{currentStreak}-day streak</strong> on Bara Afrika — that's
                    amazing! But we haven't seen you today, and your streak will reset at midnight
                    if you don't log in.
                </Text>

                <Section style={streakCard}>
                    <Text style={streakNumber}>{currentStreak}</Text>
                    <Text style={streakLabel}>Day Streak 🔥</Text>
                    <Text style={streakSub}>Last active: {lastActivityDate}</Text>
                </Section>

                <Text style={text}>
                    Log in now to keep your streak alive. Even a quick visit counts — spin the
                    daily wheel, check your missions, or browse the marketplace.
                </Text>

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard`}>
                        Keep My Streak Alive →
                    </Link>
                </Section>

                <Text style={tipText}>
                    💡 <strong>Tip:</strong> Streaks earn you bonus XP multipliers. A 7-day streak
                    gives you 1.5× XP on everything you do!
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
                </Text>
            </Container>
        </Body>
    </Html>
);

export default StreakWarningEmail;

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

const warningSection = {
    textAlign: "center" as const,
    marginBottom: "8px",
};

const flameEmoji = {
    fontSize: "48px",
    textAlign: "center" as const,
    margin: "0",
    lineHeight: "1",
};

const warningLabel = {
    fontSize: "11px",
    fontWeight: "bold" as const,
    letterSpacing: "0.15em",
    color: "#ef4444",
    textAlign: "center" as const,
    margin: "8px 0 0",
    textTransform: "uppercase" as const,
};

const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "16px 0 24px",
    padding: "0",
    color: "#1a1a1a",
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginBottom: "20px",
};

const streakCard = {
    backgroundColor: "#fff7ed",
    border: "2px solid #f97316",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    textAlign: "center" as const,
};

const streakNumber = {
    fontSize: "64px",
    fontWeight: "bold" as const,
    color: "#ea580c",
    margin: "0",
    lineHeight: "1",
};

const streakLabel = {
    fontSize: "20px",
    fontWeight: "bold" as const,
    color: "#9a3412",
    margin: "8px 0 4px",
};

const streakSub = {
    fontSize: "13px",
    color: "#c2410c",
    margin: "0",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "24px",
};

const button = {
    backgroundColor: "#ef4444",
    borderRadius: "100px",
    color: "#ffffff",
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
