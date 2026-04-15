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

interface SongUploadedEmailProps {
    artistName?: string;
    songTitle?: string;
    songId?: string;
    albumTitle?: string;
    coverUrl?: string;
}

export const SongUploadedEmail = ({
    artistName = "Artist",
    songTitle = "Your Song",
    songId = "",
    albumTitle,
    coverUrl,
}: SongUploadedEmailProps) => (
    <Html>
        <Head />
        <Preview>Your song "{songTitle}" is now live on Bara Streams</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="170"
                    height="50"
                    alt="Bara Afrika"
                    style={logo}
                />
                <Heading style={h1}>Your Song is Live!</Heading>
                <Text style={text}>Hi {artistName},</Text>
                <Text style={text}>
                    Great news — <strong>"{songTitle}"</strong>
                    {albumTitle ? <> from <strong>{albumTitle}</strong></> : null} has finished processing
                    and is now available on Bara Streams for listeners across Africa to enjoy.
                </Text>
                {coverUrl ? (
                    <Section style={{ textAlign: "center", marginBottom: "24px" }}>
                        <Img src={coverUrl} width="240" height="240" alt={songTitle} style={{ margin: "0 auto", borderRadius: "12px" }} />
                    </Section>
                ) : null}
                <Section style={btnContainer}>
                    <Link style={button} href={songId ? `${baseUrl}/streams/songs/${songId}` : `${baseUrl}/streams`}>
                        Listen Now
                    </Link>
                </Section>
                <Text style={text}>
                    Share it with your fans and watch your plays, likes, and followers grow.
                    Track your performance any time from your artist dashboard.
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

export default SongUploadedEmail;
