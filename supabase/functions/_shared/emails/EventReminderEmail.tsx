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

interface EventReminderEmailProps {
    userFirstname?: string;
    eventTitle?: string;
    eventDate?: string;
    eventTime?: string;
    eventLocation?: string;
    eventId?: string;
    ticketType?: string;
    organizerName?: string;
}

const baseUrl = "https://baraafrika.com";

export const EventReminderEmail = ({
    userFirstname = "Explorer",
    eventTitle = "Your Upcoming Event",
    eventDate = "Tomorrow",
    eventTime = "",
    eventLocation = "",
    eventId = "",
    ticketType = "General Admission",
    organizerName = "the organizer",
}: EventReminderEmailProps) => (
    <Html>
        <Head />
        <Preview>📅 Reminder: {eventTitle} is tomorrow!</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />

                <Section style={reminderBadge}>
                    <Text style={calendarEmoji}>📅</Text>
                    <Text style={reminderLabel}>EVENT REMINDER — 24 HOURS TO GO</Text>
                </Section>

                <Heading style={h1}>See you tomorrow!</Heading>

                <Text style={text}>Hi {userFirstname},</Text>
                <Text style={text}>
                    This is a friendly reminder that <strong>{eventTitle}</strong> is happening
                    tomorrow. Get ready — it's going to be a great time!
                </Text>

                <Section style={eventCard}>
                    <Text style={eventName}>{eventTitle}</Text>
                    <Section style={detailsGrid}>
                        <Text style={detailRow}>
                            📅 <strong>Date:</strong> {eventDate}
                        </Text>
                        {eventTime && (
                            <Text style={detailRow}>
                                🕐 <strong>Time:</strong> {eventTime}
                            </Text>
                        )}
                        {eventLocation && (
                            <Text style={detailRow}>
                                📍 <strong>Location:</strong> {eventLocation}
                            </Text>
                        )}
                        <Text style={detailRow}>
                            🎟️ <strong>Ticket:</strong> {ticketType}
                        </Text>
                        {organizerName && (
                            <Text style={detailRow}>
                                👤 <strong>Organizer:</strong> {organizerName}
                            </Text>
                        )}
                    </Section>
                </Section>

                {eventId && (
                    <Section style={btnContainer}>
                        <Link style={button} href={`${baseUrl}/events/${eventId}`}>
                            View Event Details
                        </Link>
                    </Section>
                )}

                <Text style={text}>
                    Make sure you have your ticket ready. Check your Bara Afrika account for
                    your QR code or ticket confirmation.
                </Text>

                <Text style={tipText}>
                    💡 <strong>Tip:</strong> Attending events earns you XP and Bara Coins!
                    Don't forget to check in and leave a review after the event.
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

export default EventReminderEmail;

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

const reminderBadge = {
    textAlign: "center" as const,
    marginBottom: "8px",
};

const calendarEmoji = {
    fontSize: "48px",
    textAlign: "center" as const,
    margin: "0",
    lineHeight: "1",
};

const reminderLabel = {
    fontSize: "11px",
    fontWeight: "bold" as const,
    letterSpacing: "0.15em",
    color: "#3b82f6",
    textAlign: "center" as const,
    margin: "8px 0 0",
    textTransform: "uppercase" as const,
};

const h1 = {
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "16px 0 24px",
    padding: "0",
    color: "#1a1a1a",
};

const text = {
    fontSize: "16px",
    lineHeight: "26px",
    color: "#333",
    marginBottom: "20px",
};

const eventCard = {
    backgroundColor: "#eff6ff",
    border: "2px solid #3b82f6",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "24px",
};

const eventName = {
    fontSize: "18px",
    fontWeight: "bold" as const,
    color: "#1e3a8a",
    margin: "0 0 16px",
    textAlign: "center" as const,
};

const detailsGrid = {
    padding: "0",
};

const detailRow = {
    fontSize: "14px",
    color: "#1e40af",
    margin: "6px 0",
    lineHeight: "20px",
};

const btnContainer = {
    textAlign: "center" as const,
    marginTop: "32px",
    marginBottom: "32px",
};

const button = {
    backgroundColor: "#000000",
    borderRadius: "100px",
    color: "#FFD700",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 24px",
    fontWeight: "bold",
};

const tipText = {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#555",
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "24px",
};

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
};
