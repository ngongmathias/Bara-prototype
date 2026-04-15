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

interface EventApprovedEmailProps {
    organizerName?: string;
    eventName?: string;
    eventId?: string;
}

export const EventApprovedEmail = ({
    organizerName = "Organizer",
    eventName = "Your Event",
    eventId = "",
}: EventApprovedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your event has been approved and is now live!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>🎉 Event Approved!</Heading>
                <Text style={text}>Hi {organizerName},</Text>
                <Text style={text}>
                    Great news! <strong>{eventName}</strong> has been approved and is now live on the Bara Afrika Events Calendar.
                </Text>
                <Text style={text}>
                    Your event is now visible to thousands of users across the platform. Share the link below to spread the word!
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/events`}>
                        View Your Event
                    </Link>
                </Section>
                <Text style={text}>
                    You can manage registrations and event details from your dashboard.
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

export default EventApprovedEmail;

