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
    footerLink,
    h1,
    logo,
    main,
    text,
} from "./emailStyles.ts";

interface WelcomeEmailProps {
    userFirstname?: string;
}

export const WelcomeEmail = ({
    userFirstname = "Apps",
}: WelcomeEmailProps) => (
    <Html>
        <Head />
        <Preview>Welcome to Bara Afrika!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Welcome to Bara Afrika!</Heading>
                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Thank you for joining Bara Afrika, the heartbeat of African commerce and community.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={baseUrl}>
                        Go to Dashboard
                    </Link>
                </Section>
                <Text style={text}>
                    If you have any questions, feel free to reply to this email.
                </Text>
                <Text style={footer}>
                    &copy; 2026 Bara Afrika. All rights reserved.
                    <br />
                    <Link href={`${baseUrl}/users/dashboard/settings`} style={footerLink}>
                        Email Preferences
                    </Link>
                    {" · "}
                    <Link href={`${baseUrl}/contact-us`} style={footerLink}>
                        Contact Us
                    </Link>
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;
