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

interface BlogDeclinedEmailProps {
    authorName?: string;
    articleTitle?: string;
    articleId?: string;
    declineReason?: string;
}

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

