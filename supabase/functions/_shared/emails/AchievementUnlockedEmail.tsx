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

interface AchievementUnlockedEmailProps {
    userFirstname?: string;
    achievementTitle?: string;
    achievementDescription?: string;
    xpReward?: number;
    coinReward?: number;
    category?: string;
}

const baseUrl = "https://baraafrika.com";

export const AchievementUnlockedEmail = ({
    userFirstname = "Explorer",
    achievementTitle = "Achievement Unlocked",
    achievementDescription = "You've reached a new milestone on Bara Afrika!",
    xpReward = 0,
    coinReward = 0,
    category = "general",
}: AchievementUnlockedEmailProps) => (
    <Html>
        <Head />
        <Preview>🏆 Achievement Unlocked: {achievementTitle}!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />

                <Section style={badgeSection}>
                    <Text style={badgeEmoji}>🏆</Text>
                    <Text style={badgeLabel}>ACHIEVEMENT UNLOCKED</Text>
                </Section>

                <Heading style={h1}>{achievementTitle}</Heading>

                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Congratulations! You've just unlocked a new achievement on Bara Afrika.
                    Your dedication to the community is paying off!
                </Text>

                <Section style={achievementCard}>
                    <Text style={achievementTitle_style}>{achievementTitle}</Text>
                    <Text style={achievementDesc}>{achievementDescription}</Text>
                    <Section style={rewardsRow}>
                        {xpReward > 0 && (
                            <Text style={rewardBadge}>⚡ +{xpReward} XP</Text>
                        )}
                        {coinReward > 0 && (
                            <Text style={coinBadge}>🪙 +{coinReward} Bara Coins</Text>
                        )}
                    </Section>
                </Section>

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard`}>
                        View Your Achievements
                    </Link>
                </Section>

                <Text style={text}>
                    Keep exploring, engaging, and growing on Bara Afrika. There are many more
                    achievements waiting for you!
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

export default AchievementUnlockedEmail;

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

const badgeSection = {
    textAlign: "center" as const,
    marginBottom: "8px",
};

const badgeEmoji = {
    fontSize: "48px",
    textAlign: "center" as const,
    margin: "0",
    lineHeight: "1",
};

const badgeLabel = {
    fontSize: "11px",
    fontWeight: "bold" as const,
    letterSpacing: "0.15em",
    color: "#f59e0b",
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

const achievementCard = {
    backgroundColor: "#fffbeb",
    border: "2px solid #f59e0b",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
    textAlign: "center" as const,
};

const achievementTitle_style = {
    fontSize: "18px",
    fontWeight: "bold" as const,
    color: "#92400e",
    margin: "0 0 8px",
};

const achievementDesc = {
    fontSize: "14px",
    color: "#78350f",
    margin: "0 0 16px",
    lineHeight: "22px",
};

const rewardsRow = {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
};

const rewardBadge = {
    display: "inline-block",
    backgroundColor: "#7c3aed",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "bold" as const,
    padding: "4px 12px",
    borderRadius: "100px",
    margin: "0 4px",
};

const coinBadge = {
    display: "inline-block",
    backgroundColor: "#d97706",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "bold" as const,
    padding: "4px 12px",
    borderRadius: "100px",
    margin: "0 4px",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "32px",
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

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
};
