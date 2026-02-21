import { renderAsync } from "npm:@react-email/render@0.0.7";
import { WelcomeEmail } from "../_shared/emails/WelcomeEmail.tsx";
import { ListingCreatedEmail } from "../_shared/emails/ListingCreatedEmail.tsx";
import { EventSubmittedEmail } from "../_shared/emails/EventSubmittedEmail.tsx";
import { BannerRequestEmail } from "../_shared/emails/BannerRequestEmail.tsx";
import { ListingApprovedEmail } from "../_shared/emails/ListingApprovedEmail.tsx";
import { ListingRejectedEmail } from "../_shared/emails/ListingRejectedEmail.tsx";
import { TicketPurchasedEmail } from "../_shared/emails/TicketPurchasedEmail.tsx";
import React from "npm:react@18.2.0";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface EmailPayload {
    to_email?: string;
    subject?: string;
    html_content?: string;
    type?: string;
    data?: any;
    to?: string | string[]; // Fallback for direct calls
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

        const body = await req.json();
        console.log("Processing email request:", JSON.stringify(body, null, 2));

        // Handle standard payload OR Supabase Webhook payload (wrapped in 'record')
        const payload: EmailPayload = body.record || body;

        const to = payload.to_email || payload.to;
        const subject = payload.subject;
        const from = payload.from || Deno.env.get("RESEND_FROM_EMAIL") || "Bara Afrika <onboarding@resend.dev>";

        if (!to || !subject) {
            throw new Error("Missing 'to' or 'subject' in email request");
        }

        let html = payload.html_content;

        // If no raw HTML is provided, try to render using templates
        if (!html && (payload.type || body.type)) {
            const type = payload.type || body.type;
            const data = payload.data || body.data || {};

            switch (type) {
                case 'welcome':
                case 'welcome_email':
                    html = await renderAsync(React.createElement(WelcomeEmail, data));
                    break;
                case 'ticket_purchased':
                case 'ticket_free':
                case 'ticket_paid_confirmed':
                case 'ticket_reserved_pending':
                    html = await renderAsync(React.createElement(TicketPurchasedEmail, data));
                    break;
                case 'listing_created':
                case 'marketplace_submission':
                    html = await renderAsync(React.createElement(ListingCreatedEmail, data));
                    break;
                case 'listing_approved':
                case 'marketplace_published':
                    html = await renderAsync(React.createElement(ListingApprovedEmail, data));
                    break;
                case 'listing_rejected':
                    html = await renderAsync(React.createElement(ListingRejectedEmail, data));
                    break;
                case 'event_submitted':
                case 'event_submission':
                    html = await renderAsync(React.createElement(EventSubmittedEmail, data));
                    break;
                case 'banner_request':
                case 'banner_submission':
                    html = await renderAsync(React.createElement(BannerRequestEmail, data));
                    break;
                default:
                    // If type is recognized but we don't have a template, we'll error
                    // unless raw HTML was already provided.
                    if (!html) throw new Error(`Invalid email type: ${type}`);
            }
        }

        if (!html) {
            throw new Error("Could not determine email content (missing html_content or valid type)");
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
            console.error("Resend API Error:", responseData);
            return new Response(JSON.stringify({
                error: responseData.message || responseData.error || "Unknown Resend error",
                details: responseData
            }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify(responseData), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error: any) {
        console.error("Email function error:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
