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

/**
 * Sent to a SELLER when a buyer reserves one of their items.
 *
 * There is no payment processing yet (Phase 15), so the seller is the one who
 * collects the money and confirms it. The whole point of this email is that the
 * seller finds out at all — before it existed, an order was created and nobody
 * was ever told, which is why zero orders had ever been completed.
 *
 * It therefore leads with the buyer's contact details and one clear action.
 */
interface OrderPlacedEmailProps {
    sellerFirstname?: string;
    buyerName?: string;
    itemName?: string;
    quantity?: number;
    totalAmount?: string;
    buyerMessage?: string;
    orderId?: string;
}

export const OrderPlacedEmail = ({
    sellerFirstname = "there",
    buyerName = "A buyer",
    itemName = "your item",
    quantity = 1,
    totalAmount = "",
    buyerMessage = "",
    orderId = "",
}: OrderPlacedEmailProps) => (
    <Html>
        <Head />
        <Preview>{buyerName} wants to buy {itemName}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>You have a new order</Heading>
                <Text style={text}>Hi {sellerFirstname},</Text>
                <Text style={text}>
                    <strong>{buyerName}</strong> reserved <strong>{itemName}</strong> on BARA.
                    Get in touch to arrange payment, then mark the order as paid so they
                    know you received it.
                </Text>

                <Section style={detailsContainer}>
                    <Text style={detailsText}><strong>Item:</strong> {itemName}</Text>
                    <Text style={detailsText}><strong>Quantity:</strong> {quantity}</Text>
                    {totalAmount ? (
                        <Text style={detailsText}><strong>Total:</strong> {totalAmount}</Text>
                    ) : null}
                    {orderId ? (
                        <Text style={detailsText}><strong>Order ID:</strong> {orderId}</Text>
                    ) : null}
                </Section>

                {buyerMessage ? (
                    <Section style={detailsContainer}>
                        <Text style={detailsText}><strong>Their message:</strong></Text>
                        <Text style={detailsText}>{buyerMessage}</Text>
                    </Section>
                ) : null}

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/marketplace/my-ads`}>
                        View the order
                    </Link>
                </Section>

                <Text style={text}>
                    BARA doesn't take payment yet, so you collect it directly — mobile money,
                    cash or bank transfer, whatever you both prefer.
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

export default OrderPlacedEmail;

const detailsContainer = {
    backgroundColor: "#f9fafb",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "20px 0",
};

const detailsText = {
    fontSize: "14px",
    lineHeight: "22px",
    color: "#374151",
    margin: "4px 0",
};
