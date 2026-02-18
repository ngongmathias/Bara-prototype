import { renderAsync } from "npm:@react-email/render@0.0.7";
import { WelcomeEmail } from "../../emails/WelcomeEmail.tsx";
import { ListingCreatedEmail } from "../../emails/ListingCreatedEmail.tsx";
import { EventSubmittedEmail } from "../../emails/EventSubmittedEmail.tsx";
import { BannerRequestEmail } from "../../emails/BannerRequestEmail.tsx";
import { ListingApprovedEmail } from "../../emails/ListingApprovedEmail.tsx";
import { ListingRejectedEmail } from "../../emails/ListingRejectedEmail.tsx";
import { TicketPurchasedEmail } from "../../emails/TicketPurchasedEmail.tsx";
import React from "npm:react@18.2.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailRequest {
    to: string | string[];
    subject: string;
    type: 'welcome' | 'listing_created' | 'event_submitted' | 'banner_request' | 'listing_approved' | 'listing_rejected' | 'ticket_purchased';
    data: any;
    from?: string;
}

Deno.serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!RESEND_API_KEY) {
            throw new Error("Missing RESEND_API_KEY environment variable");
        }

        const { to, subject, type, data, from = "Bara Afrika <onboarding@resend.dev>" }: EmailRequest = await req.json();

        let html;
        switch (type) {
            case 'welcome':
                html = await renderAsync(React.createElement(WelcomeEmail, data));
                break;
            case 'ticket_purchased':
                html = await renderAsync(React.createElement(TicketPurchasedEmail, data));
                break;
            case 'listing_created':
                html = await renderAsync(React.createElement(ListingCreatedEmail, data));
                break;
            case 'listing_approved':
                html = await renderAsync(React.createElement(ListingApprovedEmail, data));
                break;
            case 'listing_rejected':
                html = await renderAsync(React.createElement(ListingRejectedEmail, data));
                break;
            case 'event_submitted':
                html = await renderAsync(React.createElement(EventSubmittedEmail, data));
                break;
            case 'banner_request':
                html = await renderAsync(React.createElement(BannerRequestEmail, data));
                break;
            default:
                throw new Error('Invalid email type');
        }

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from,
                to,
                subject,
                html,
            }),
        });

        const responseData = await res.json();

        if (!res.ok) {
            return new Response(JSON.stringify({ error: responseData }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
