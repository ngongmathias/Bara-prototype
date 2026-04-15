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

interface EventSubmittedEmailProps {
    organizerName?: string;
    eventName?: string;
}


export const EventSubmittedEmail = ({
    organizerName = "Organizer",
    eventName = "Your Event",
}: EventSubmittedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your event submission has been received!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Event Submission Received</Heading>
                <Text style={text}>Hi {organizerName},</Text>
                <Text style={text}>
                    Thank you for submitting <strong>{eventName}</strong> to the Bara Afrika Events Calendar.
                </Text>
                <Text style={text}>
                    Our team is reviewing your event details to ensuring everything looks great. Once approved, your event will be live and visible to thousands of users.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard/events`}>
                        Manage My Events
                    </Link>
                </Section>
                <Text style={text}>
                    We'll notify you as soon as your event is published.
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

export default EventSubmittedEmail;


