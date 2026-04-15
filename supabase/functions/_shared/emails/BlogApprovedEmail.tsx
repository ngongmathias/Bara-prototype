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

import {
    baseUrl,
    btnContainer,
    button,
    container,
    footer,
    h1,
    logo,
    main,
    text,
} from "./emailStyles.ts";

interface BlogApprovedEmailProps {
    authorName?: string;
    articleTitle?: string;
    articleSlug?: string;
    xpEarned?: number;
    coinsEarned?: number;
}

export const BlogApprovedEmail = ({
    authorName = "Contributor",
    articleTitle = "Your Article",
    articleSlug = "",
    xpEarned = 150,
    coinsEarned = 25,
}: BlogApprovedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your article is live on Bara Afrika — congratulations!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Your Article is Live!</Heading>
                <Text style={text}>Hi {authorName},</Text>
                <Text style={text}>
                    Congratulations — <strong>"{articleTitle}"</strong> has been approved by our editorial team
                    and is now published on the Bara Afrika Blog!
                </Text>
                <Text style={text}>
                    Your article is now visible to thousands of readers across the platform. Share it with your network!
                </Text>
                <Section style={btnContainer}>
                    <Link
                        style={button}
                        href={articleSlug ? `${baseUrl}/blog/${articleSlug}` : `${baseUrl}/blog`}
                    >
                        Read Your Article
                    </Link>
                </Section>
                {(xpEarned > 0 || coinsEarned > 0) && (
                    <Section style={rewardBox}>
                        <Text style={rewardTitle}>You earned rewards for this publication:</Text>
                        <Text style={rewardText}>
                            {xpEarned > 0 && `+${xpEarned} XP`}
                            {xpEarned > 0 && coinsEarned > 0 && "  ·  "}
                            {coinsEarned > 0 && `+${coinsEarned} Bara Coins`}
                        </Text>
                    </Section>
                )}
                <Text style={text}>
                    Keep writing — every published article builds your reputation on the platform.
                    Visit your{" "}
                    <Link href={`${baseUrl}/users/dashboard/my-blog`} style={{ color: "#0066cc" }}>
                        dashboard
                    </Link>{" "}
                    to track views and manage your articles.
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

export default BlogApprovedEmail;

const rewardBox = {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "16px 24px",
    marginBottom: "24px",
    textAlign: "center" as const,
};

const rewardTitle = {
    fontSize: "13px",
    color: "#666",
    margin: "0 0 6px 0",
};

const rewardText = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#1a1a1a",
    margin: "0",
};

