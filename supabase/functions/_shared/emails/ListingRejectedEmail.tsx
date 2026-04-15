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

interface ListingRejectedEmailProps {
    userFirstname?: string;
    listingTitle?: string;
    reason?: string;
}


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

export default ListingRejectedEmail;


