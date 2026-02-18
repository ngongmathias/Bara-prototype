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

interface ListingApprovedEmailProps {
    userFirstname?: string;
    listingTitle?: string;
    listingId?: string;
}

const baseUrl = "https://baraafrika.com";

export const ListingApprovedEmail = ({
    userFirstname = "User",
    listingTitle = "Your Listing",
    listingId = "123",
}: ListingApprovedEmailProps) => (
    <Html>
        <Head />
        <Preview>Good news! Your listing is live.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Ad Approved!</Heading>
                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Great news! Your ad for <strong>{listingTitle}</strong> has been approved and is now live on the marketplace.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/marketplace/listing/${listingId}`}>
                        View Ad
                    </Link>
                </Section>
                <Text style={text}>
                    You can share your ad on social media to reach more buyers.
                </Text>
                <Text style={footer}>
                    &copy; 2026 Bara Afrika. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default ListingApprovedEmail;

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
