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
 * Sent to a BUYER when the seller confirms they've received payment.
 *
 * Today a seller triggers this by tapping "Mark as paid". When Phase 15 lands,
 * the Flutterwave webhook flips the same `payment_status` and this same email
 * goes out — the buyer's experience of being told doesn't change.
 */
interface OrderConfirmedEmailProps {
    buyerFirstname?: string;
    itemName?: string;
    sellerName?: string;
    totalAmount?: string;
    orderId?: string;
}

export const OrderConfirmedEmail = ({
    buyerFirstname = "there",
    itemName = "your order",
    sellerName = "The seller",
    totalAmount = "",
    orderId = "",
}: OrderConfirmedEmailProps) => (
    <Html>
        <Head />
        <Preview>Payment confirmed for {itemName}</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Payment confirmed</Heading>
                <Text style={text}>Hi {buyerFirstname},</Text>
                <Text style={text}>
                    {sellerName} confirmed receiving your payment for <strong>{itemName}</strong>.
                    Arrange collection or delivery with them directly.
                </Text>

                <Section style={detailsContainer}>
                    <Text style={detailsText}><strong>Item:</strong> {itemName}</Text>
                    {totalAmount ? (
                        <Text style={detailsText}><strong>Paid:</strong> {totalAmount}</Text>
                    ) : null}
                    {orderId ? (
                        <Text style={detailsText}><strong>Order ID:</strong> {orderId}</Text>
                    ) : null}
                </Section>

                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/marketplace/my-purchases`}>
                        View your order
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

export default OrderConfirmedEmail;

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
