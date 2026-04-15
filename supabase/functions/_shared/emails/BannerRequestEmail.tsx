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

interface BannerRequestEmailProps {
    userName?: string;
    bannerType?: string;
}


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

export default BannerRequestEmail;


