import { renderAsync } from "npm:@react-email/render@0.0.7";

import { WelcomeEmail } from "../_shared/emails/WelcomeEmail.tsx";

import { ListingCreatedEmail } from "../_shared/emails/ListingCreatedEmail.tsx";

import { EventSubmittedEmail } from "../_shared/emails/EventSubmittedEmail.tsx";

import { BannerRequestEmail } from "../_shared/emails/BannerRequestEmail.tsx";

import { ListingApprovedEmail } from "../_shared/emails/ListingApprovedEmail.tsx";

import { ListingRejectedEmail } from "../_shared/emails/ListingRejectedEmail.tsx";

import { TicketPurchasedEmail } from "../_shared/emails/TicketPurchasedEmail.tsx";

import { EventApprovedEmail } from "../_shared/emails/EventApprovedEmail.tsx";

import { EventRejectedEmail } from "../_shared/emails/EventRejectedEmail.tsx";

import { ContactFormConfirmationEmail } from "../_shared/emails/ContactFormConfirmationEmail.tsx";

import React from "npm:react@18.2.0";



import { createClient } from "https://esm.sh/@supabase/supabase-js@2";



const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";

const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";



const corsHeaders = {

    "Access-Control-Allow-Origin": "*",

    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",

    "Access-Control-Allow-Methods": "POST, OPTIONS",

};



interface EmailPayload {

    id?: string;

    to_email?: string;

    subject?: string;

    html_content?: string;

    type?: string;

    data?: any;

    metadata?: any;

    to?: string | string[];

    from?: string;

    retry_count?: number;

}



Deno.serve(async (req) => {

    if (req.method === "OPTIONS") {

        return new Response("ok", { headers: corsHeaders });

    }



    try {

        if (!RESEND_API_KEY) {

            throw new Error("Missing RESEND_API_KEY environment variable");

        }



        const body = await req.json();

        console.log("Processing email request:", JSON.stringify(body, null, 2));



        // Detect if this is a Supabase Webhook (it has 'record' and 'type' like 'INSERT')

        const isWebhook = !!body.record;

        const payload: EmailPayload = body.record || body;

        const queueId = isWebhook ? payload.id : null;



        // Extract basic fields

        // Note: For queue records, fields are in the record itself (payload)

        const to = payload.to_email || payload.to || payload.metadata?.to_email || body.to;

        const subject = payload.subject || payload.metadata?.subject || body.subject;

        const from = payload.from || body.from || Deno.env.get("RESEND_FROM_EMAIL") || "Bara Afrika <onboarding@resend.dev>";



        if (!to || !subject) {

            console.error("Missing to/subject. Payload:", JSON.stringify(payload));

            throw new Error("Missing 'to' or 'subject' in email request");

        }



        let html = payload.html_content || payload.metadata?.html_content || body.html || body.html_content;



        // Determine Template Type

        // CRITICAL: Webhooks use body.type for the DB operation (INSERT/UPDATE).

        // We MUST prioritize metadata.type (template name) for webhooks.

        let templateType = payload.type || body.type;

        if (isWebhook && payload.metadata?.type) {

            templateType = payload.metadata.type;

        } else if (!payload.type && payload.metadata?.type) {

            templateType = payload.metadata.type;

        }



        // Determine Template Data

        const templateData = payload.metadata?.data || payload.data || body.data || {};



        console.log(`Email details - To: ${to}, Subject: ${subject}, Template: ${templateType}`);



        if (!html && templateType) {

            switch (templateType) {

                case 'welcome':

                case 'welcome_email':

                    html = await renderAsync(React.createElement(WelcomeEmail, templateData));

                    break;

                case 'ticket_purchased':

                case 'ticket_free':

                case 'ticket_paid_confirmed':

                case 'ticket_reserved_pending':

                    html = await renderAsync(React.createElement(TicketPurchasedEmail, templateData));

                    break;

                case 'listing_created':

                case 'marketplace_submission':

                    html = await renderAsync(React.createElement(ListingCreatedEmail, templateData));

                    break;

                case 'listing_approved':

                case 'marketplace_published':

                    html = await renderAsync(React.createElement(ListingApprovedEmail, templateData));

                    break;

                case 'listing_rejected':

                    html = await renderAsync(React.createElement(ListingRejectedEmail, templateData));

                    break;

                case 'event_submitted':

                case 'event_submission':

                    html = await renderAsync(React.createElement(EventSubmittedEmail, templateData));

                    break;

                case 'banner_request':

                case 'banner_submission':

                    html = await renderAsync(React.createElement(BannerRequestEmail, templateData));

                    break;

                case 'event_approved':

                    html = await renderAsync(React.createElement(EventApprovedEmail, templateData));

                    break;

                case 'event_rejected':

                    html = await renderAsync(React.createElement(EventRejectedEmail, templateData));

                    break;

                case 'contact_form_confirmation':

                    html = await renderAsync(React.createElement(ContactFormConfirmationEmail, templateData));

                    break;

                case 'INSERT':

                case 'UPDATE':

                    // If we get here, it means we didn't find a template type in metadata

                    if (!html) throw new Error("Webhook received but no email template type found in metadata");

                    break;

                default:

                    if (!html) throw new Error(`Invalid email type: ${templateType}`);

            }

        }



        if (!html) {

            throw new Error("Could not determine email content (missing html_content and no valid template type)");

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



        // Update email_queue status after send attempt

        if (queueId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {

            try {

                const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

                if (res.ok) {

                    await supabaseAdmin

                        .from("email_queue")

                        .update({ status: "sent", sent_at: new Date().toISOString() })

                        .eq("id", queueId);

                    console.log(`Queue row ${queueId} marked as sent`);

                } else {

                    await supabaseAdmin

                        .from("email_queue")

                        .update({

                            status: "failed",

                            error_message: JSON.stringify(responseData),

                            retry_count: payload.retry_count ? payload.retry_count + 1 : 1,

                        })

                        .eq("id", queueId);

                    console.log(`Queue row ${queueId} marked as failed`);

                }

            } catch (updateErr: any) {

                console.error("Failed to update email_queue status:", updateErr.message);

            }

        }



        if (!res.ok) {

            console.error("Resend API Error:", responseData);

            return new Response(JSON.stringify(responseData), {

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

