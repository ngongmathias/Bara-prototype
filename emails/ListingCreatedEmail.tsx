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

interface ListingCreatedEmailProps {
    userFirstname?: string;
    listingTitle?: string;
    listingId?: string;
    categoryName?: string;
    price?: string;
    currency?: string;
    location?: string;
}

const baseUrl = "https://baraafrika.com";

export const ListingCreatedEmail = ({
    userFirstname = "User",
    listingTitle = "New Listing",
    listingId = "123",
    categoryName = "General",
    price = "0",
    currency = "RWF",
    location = "Rwanda",
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
                <Section style={adDetails}>
                    <Text style={detailRow}>
                        <strong>Category:</strong> {categoryName}
                    </Text>
                    <Text style={detailRow}>
                        <strong>Price:</strong> {currency} {price}
                    </Text>
                    <Text style={detailRow}>
                        <strong>Location:</strong> {location}
                    </Text>
                </Section>
                <Text style={text}>
                    Your ad is now live and visible to buyers! You can view and manage it anytime.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/marketplace/ad/${listingId}`}>
                        View Your Ad
                    </Link>
                </Section>
                <Section style={btnContainer}>
                    <Link style={secondaryButton} href={`${baseUrl}/marketplace/my-ads`}>
                        Manage All My Ads
                    </Link>
                </Section>
                <Text style={text}>
                    <strong>Tips for success:</strong>
                    <br />• Respond quickly to inquiries
                    <br />• Keep your contact details up to date
                    <br />• Mark your ad as sold when complete
                </Text>
                <Text style={footer}>
                    &copy; 2026 Bara Afrika. All rights reserved.
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

const adDetails = {
    backgroundColor: "#f6f6f6",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
};

const detailRow = {
    fontSize: "14px",
    lineHeight: "24px",
    color: "#333",
    margin: "4px 0",
};

const secondaryButton = {
    backgroundColor: "#ffffff",
    border: "2px solid #000000",
    borderRadius: "100px",
    color: "#000000",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
    fontWeight: "bold",
};
