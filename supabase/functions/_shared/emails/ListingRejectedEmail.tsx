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

interface ListingRejectedEmailProps {
    userFirstname?: string;
    listingTitle?: string;
    reason?: string;
}

const baseUrl = "https://baraafrika.com";

export const ListingRejectedEmail = ({
    userFirstname = "User",
    listingTitle = "Your Listing",
    reason = "Does not meet community guidelines",
}: ListingRejectedEmailProps) => (
    <Html>
        <Head />
        <Preview>Update regarding your listing.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Ad Update</Heading>
                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Thank you for posting <strong>{listingTitle}</strong>. Unfortunately, we could not approve it at this time.
                </Text>
                <Text style={text}>
                    <strong>Reason:</strong> {reason}
                </Text>
                <Text style={text}>
                    If you believe this is a mistake, or if you can edit your ad to comply with our guidelines, please visit your dashboard.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/marketplace/my-listings`}>
                        Go to Dashboard
                    </Link>
                </Section>
                <Text style={footer}>
                    &copy; 2026 Bara Afrika. All rights reserved.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default ListingRejectedEmail;

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

