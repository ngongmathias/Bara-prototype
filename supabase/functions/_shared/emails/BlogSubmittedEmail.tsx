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

interface BlogSubmittedEmailProps {
    authorName?: string;
    articleTitle?: string;
}

const baseUrl = "https://baraafrika.com";

export const BlogSubmittedEmail = ({
    authorName = "Contributor",
    articleTitle = "Your Article",
}: BlogSubmittedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your article is under review — we'll be in touch soon.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Article Received</Heading>
                <Text style={text}>Hi {authorName},</Text>
                <Text style={text}>
                    Thank you for submitting <strong>"{articleTitle}"</strong> to the Bara Afrika Blog.
                </Text>
                <Text style={text}>
                    Our editorial team will review your article and notify you of the outcome, usually within 1–3 business days.
                    You can track the status of your submission from your dashboard.
                </Text>
                <Section style={btnContainer}>
                    <Link style={button} href={`${baseUrl}/users/dashboard/my-blog`}>
                        View My Submissions
                    </Link>
                </Section>
                <Text style={text}>
                    While you wait, feel free to explore our{" "}
                    <Link href={`${baseUrl}/blog/guidelines`} style={{ color: "#0066cc" }}>
                        Contributor Guidelines
                    </Link>{" "}
                    for tips on writing for our community.
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

export default BlogSubmittedEmail;

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

const footer = {
    color: "#8898aa",
    fontSize: "12px",
    marginBottom: "24px",
    textAlign: "center" as const,
};
