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
} from "@react-email/components";
import * as React from "react";

interface TicketPurchasedEmailProps {
    userFirstname?: string;
    eventName?: string;
    eventDate?: string;
    ticketCount?: number;
    totalAmount?: string;
    ticketId?: string;
}

const baseUrl = "https://baraafrika.com";

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
                </Text>
            </Container>
        </Body>
    </Html>
);

export default TicketPurchasedEmail;

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
