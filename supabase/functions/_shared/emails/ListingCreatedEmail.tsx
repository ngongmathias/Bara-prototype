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

interface ListingCreatedEmailProps {
    userFirstname?: string;
    listingTitle?: string;
    listingId?: string;
}

const baseUrl = "https://baraafrika.com";

export const ListingCreatedEmail = ({
    userFirstname = "User",
    listingTitle = "New Listing",
    listingId = "123",
}: ListingCreatedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your listing has been submitted!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Marketplace Ad Received</Heading>
                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Thanks for posting <strong>{listingTitle}</strong> on Bara Afrika Marketplace.
                </Text>
                <Text style={text}>
                    Your ad is currently under review to ensure it meets our community guidelines. We usually process reviews within 24 hours.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/marketplace/my-listings`}>
                        View My Ads
                    </Link>
                </Section>
                <Text style={text}>
                    You will receive another email once your ad is approved and live.
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

export default ListingCreatedEmail;

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

