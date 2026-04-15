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

interface TicketPurchasedEmailProps {
    userFirstname?: string;
    eventName?: string;
    eventDate?: string;
    ticketCount?: number;
    totalAmount?: string;
    ticketId?: string;
}


export const TicketPurchasedEmail = ({
    userFirstname = "User",
    eventName = "Upcoming Event",
    eventDate = "TBD",
    ticketCount = 1,
    totalAmount = "$0.00",
    ticketId = "T-123456",
}: TicketPurchasedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your tickets for {eventName} are confirmed!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Order Confirmed</Heading>
                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    Thank you for your purchase! You are going to <strong>{eventName}</strong>.
                </Text>

                <Section style={detailsContainer}>
                    <Text style={detailsText}><strong>Event:</strong> {eventName}</Text>
                    <Text style={detailsText}><strong>Date:</strong> {eventDate}</Text>
                    <Text style={detailsText}><strong>Tickets:</strong> {ticketCount}</Text>
                    <Text style={detailsText}><strong>Total:</strong> {totalAmount}</Text>
                    <Text style={detailsText}><strong>Order ID:</strong> {ticketId}</Text>
                </Section>

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard/tickets`}>
                        View Tickets
                    </Link>
                </Section>

                <Text style={text}>
                    Please present your ticket QR code at the entrance.
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

export default TicketPurchasedEmail;


const detailsContainer = {
    backgroundColor: "#f9fafb",
    padding: "24px",
    borderRadius: "8px",
    marginBottom: "24px",
};

const detailsText = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#4b5563",
    margin: "4px 0",
};


