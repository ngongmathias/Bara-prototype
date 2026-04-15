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

interface ContactFormConfirmationEmailProps {
    userName?: string;
    subject?: string;
}

export const ContactFormConfirmationEmail = ({
    userName = "User",
    subject = "your inquiry",
}: ContactFormConfirmationEmailProps) => (
    <Html>
        <Head />
        <Preview>We received your message!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Message Received</Heading>
                <Text style={text}>Hi {userName},</Text>
                <Text style={text}>
                    Thank you for reaching out! We've received your message regarding <strong>{subject}</strong>.
                </Text>
                <Text style={text}>
                    Our team typically responds within 24–48 hours. In the meantime, you may find answers to common questions on our FAQ page.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/faq`}>
                        Visit FAQ
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

export default ContactFormConfirmationEmail;

