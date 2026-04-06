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

interface BlogDeclinedEmailProps {
    authorName?: string;
    articleTitle?: string;
    articleId?: string;
    declineReason?: string;
}

const baseUrl = "https://baraafrika.com";

export const BlogDeclinedEmail = ({
    authorName = "Contributor",
    articleTitle = "Your Article",
    articleId = "",
    declineReason = "The article did not meet our editorial guidelines at this time.",
}: BlogDeclinedEmailProps) => (
    <Html>
        <Head />
        <Preview>Feedback on your article submission — revision needed.</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Revision Needed</Heading>
                <Text style={text}>Hi {authorName},</Text>
                <Text style={text}>
                    Thank you for submitting <strong>"{articleTitle}"</strong> to the Bara Afrika Blog.
                    After review, our editorial team has requested some changes before we can publish it.
                </Text>
                <Section style={feedbackBox}>
                    <Text style={feedbackLabel}>Editorial feedback:</Text>
                    <Text style={feedbackText}>{declineReason}</Text>
                </Section>
                <Text style={text}>
                    Please revise your article based on the feedback above and resubmit. We look forward
                    to reading your updated version!
                </Text>
                <Section style={btnContainer}>
                    <Link
                        style={button}
                        href={articleId ? `${baseUrl}/blog/edit/${articleId}` : `${baseUrl}/users/dashboard/my-blog`}
                    >
                        Edit & Resubmit
                    </Link>
                </Section>
                <Text style={text}>
                    If you have questions about the feedback, feel free to{" "}
                    <Link href={`${baseUrl}/contact-us`} style={{ color: "#0066cc" }}>
                        contact our team
                    </Link>.
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

export default BlogDeclinedEmail;

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

const feedbackBox = {
    backgroundColor: "#fff8f0",
    borderLeft: "4px solid #e8a020",
    borderRadius: "4px",
    padding: "16px 20px",
    marginBottom: "24px",
};

const feedbackLabel = {
    fontSize: "12px",
    fontWeight: "bold" as const,
    color: "#a05000",
    margin: "0 0 8px 0",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
};

const feedbackText = {
    fontSize: "15px",
    lineHeight: "24px",
    color: "#5a3000",
    margin: "0",
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
