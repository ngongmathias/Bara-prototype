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

interface ListingApprovedEmailProps {
    userFirstname?: string;
    listingTitle?: string;
    listingId?: string;
}


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
                    <Link style={button} href={`${baseUrl}/marketplace/ad/${listingId}`}>
                        View Ad
                    </Link>
                </Section>
                <Text style={text}>
                    You can share your ad on social media to reach more buyers.
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

export default ListingApprovedEmail;


