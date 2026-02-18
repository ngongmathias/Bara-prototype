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
} from "@react-email/components";
import * as React from "react";

interface BannerRequestEmailProps {
    userName?: string;
    bannerType?: string;
}

const baseUrl = "https://baraafrika.com";

export const BannerRequestEmail = ({
    userName = "Advertiser",
    bannerType = "Homepage Banner",
}: BannerRequestEmailProps) => (
    <Html>
        <Head />
        <Preview>We've received your advertising request!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Ad Request Received</Heading>
                <Text style={text}>Hi {userName},</Text>
                <Text style={text}>
                    Thanks for choosing to advertise on Bara Afrika. We have received your request for a <strong>{bannerType}</strong>.
                </Text>
                <Text style={text}>
                    Our advertising team will review your creative assets and campaign details. Verification typically takes 1-2 business days.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard/banner-submissions`}>
                        Track Request Status
                    </Link>
                </Section>
                <Text style={text}>
                    You will receive a confirmation email once your ad is live!
                </Text>
                <Text style={footer}>
                    &copy; 2026 Bara Afrika. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default BannerRequestEmail;

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

const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "30px 0",
    padding: "0",
    color: "#1a1a1a",
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginBottom: "20px",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "32px",
};

const button = {
    backgroundColor: "#000000",
    borderRadius: "100px",
    color: "#FFD700", // Bara Yellow text
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
