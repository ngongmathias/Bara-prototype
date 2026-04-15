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

interface EventRejectedEmailProps {
    organizerName?: string;
    eventName?: string;
    rejectionReason?: string;
}

export const EventRejectedEmail = ({
    organizerName = "Organizer",
    eventName = "Your Event",
    rejectionReason = "The event did not meet our community guidelines. Please review and resubmit.",
}: EventRejectedEmailProps) => (
    <Html>
        <Head />
        <Preview>Update regarding your event submission</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Event Not Approved</Heading>
                <Text style={text}>Hi {organizerName},</Text>
                <Text style={text}>
                    Unfortunately, <strong>{eventName}</strong> was not approved for the Bara Afrika Events Calendar at this time.
                </Text>
                <Text style={text}>
                    <strong>Reason:</strong> {rejectionReason}
                </Text>
                <Text style={text}>
                    You can edit your event details and resubmit from your dashboard. If you have questions, please contact our support team.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard/events`}>
                        Edit & Resubmit
                    </Link>
                </Section>
                <Text style={text}>
                    Need help? <Link href={`${baseUrl}/contact-us`} style={{ color: "#0066cc" }}>Contact Support</Link>
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

export default EventRejectedEmail;

