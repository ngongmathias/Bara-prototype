import { useState } from 'react';
import { db, supabase } from '@/lib/supabase';

export interface ListingClaim {
  id: string;
  business_id?: string;
  business_name: string;
  business_registration_number?: string;
  business_address: string;
  contact_name: string;
  registrant_title?: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  reason_for_claim: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_review';
  admin_notes?: string;
  verified_at?: string;
  processed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateListingClaimData {
  business_id?: string;
  business_name: string;
  business_registration_number: string;
  business_address: string;
  contact_name: string;
  registrant_title?: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  reason_for_claim: string;
  additional_info?: string;
}

export const useListingClaims = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createListingClaim = async (data: CreateListingClaimData): Promise<ListingClaim | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: claim, error: insertError } = await db
        .listing_claims()
        .insert([data])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Enqueue confirmation email to user + admin notification
      try {
        await supabase.from('email_queue').insert([
          {
            to_email: data.contact_email,
            subject: '📋 Business Claim Received — ' + data.business_name,
            html_content: `
              <div style="font-family:sans-serif;max-width:600px;margin:auto">
                <div style="background:#000;padding:24px;text-align:center">
                  <h1 style="color:#facc15;margin:0">Bara Afrika</h1>
                </div>
                <div style="padding:24px;background:#fff">
                  <h2>Hi ${data.contact_name},</h2>
                  <p>We've received your claim request for <strong>${data.business_name}</strong>.</p>
                  <p>Our team will review your submission and verify the details. You'll receive an email once the review is complete — typically within <strong>3-5 business days</strong>.</p>
                  <h3>Claim Summary:</h3>
                  <ul>
                    <li><strong>Business:</strong> ${data.business_name}</li>
                    <li><strong>Address:</strong> ${data.business_address}</li>
                    <li><strong>Reg. Number:</strong> ${data.business_registration_number}</li>
                  </ul>
                  <p style="margin-top:24px;color:#666">— The Bara Afrika Team</p>
                </div>
              </div>
            `,
            metadata: { type: 'business_claim_submitted', business: data.business_name }
          },
          {
            to_email: 'admin@baraafrika.com',
            subject: '🔔 New Business Claim: ' + data.business_name,
            html_content: `
              <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
                <h2>New Business Claim Submitted</h2>
                <table style="width:100%;border-collapse:collapse">
                  <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Business</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${data.business_name}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Reg #</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${data.business_registration_number}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Address</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${data.business_address}</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Contact</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${data.contact_name} &lt;${data.contact_email}&gt;</td></tr>
                  <tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Reason</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${data.reason_for_claim}</td></tr>
                </table>
                <p style="margin-top:16px">Review this claim in the admin dashboard.</p>
              </div>
            `,
            metadata: { type: 'business_claim_admin', business: data.business_name }
          }
        ]);
      } catch (emailErr) {
        console.warn('Claim email enqueue failed (non-critical):', emailErr);
      }

      return claim;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit claim request';
      setError(errorMessage);
      console.error('Error creating listing claim:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getListingClaims = async (status?: string): Promise<ListingClaim[]> => {
    setIsLoading(true);
    setError(null);

    try {
      let query = db.listing_claims().select('*');

      if (status) {
        query = query.eq('status', status);
      }

      const { data: claims, error: fetchError } = await query.order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      return claims || [];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch claims';
      setError(errorMessage);
      console.error('Error fetching listing claims:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const updateListingClaimStatus = async (
    claimId: string,
    status: 'pending' | 'approved' | 'rejected' | 'in_review',
    adminNotes?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      if (status === 'approved' || status === 'rejected') {
        updateData.verified_at = new Date().toISOString();
      }

      const { error: updateError } = await db
        .listing_claims()
        .update(updateData)
        .eq('id', claimId);

      if (updateError) {
        throw updateError;
      }

      // Send email on approval or rejection
      if (status === 'approved' || status === 'rejected') {
        try {
          // Fetch the claim to get the contact email
          const { data: claimData } = await db
            .listing_claims()
            .select('contact_email, contact_name, business_name')
            .eq('id', claimId)
            .single();

          if (claimData) {
            const isApproved = status === 'approved';
            await supabase.from('email_queue').insert({
              to_email: claimData.contact_email,
              subject: isApproved
                ? '✅ Business Verified — ' + claimData.business_name
                : '❌ Business Claim Update — ' + claimData.business_name,
              html_content: `
                <div style="font-family:sans-serif;max-width:600px;margin:auto">
                  <div style="background:#000;padding:24px;text-align:center">
                    <h1 style="color:#facc15;margin:0">Bara Afrika</h1>
                  </div>
                  <div style="padding:24px;background:#fff">
                    <h2>Hi ${claimData.contact_name},</h2>
                    ${isApproved
                  ? `<p>🎉 <strong>Congratulations!</strong> Your business <strong>${claimData.business_name}</strong> has been <span style="color:green;font-weight:bold">verified</span>.</p>
                         <p>A ✅ Verified badge now appears on your listing. You can also upgrade to Premium for top search placement and analytics.</p>`
                  : `<p>After reviewing your claim for <strong>${claimData.business_name}</strong>, we were unable to verify the ownership at this time.</p>
                         ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
                         <p>You can resubmit with additional documentation or contact us for assistance.</p>`
                }
                    <p style="margin-top:24px;color:#666">— The Bara Afrika Team</p>
                  </div>
                </div>
              `,
              metadata: { type: isApproved ? 'business_claim_approved' : 'business_claim_rejected', business: claimData.business_name }
            });
          }
        } catch (emailErr) {
          console.warn('Claim status email failed (non-critical):', emailErr);
        }
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update claim status';
      setError(errorMessage);
      console.error('Error updating listing claim:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getListingClaimById = async (claimId: string): Promise<ListingClaim | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: claim, error: fetchError } = await db
        .listing_claims()
        .select('*')
        .eq('id', claimId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      return claim;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch claim';
      setError(errorMessage);
      console.error('Error fetching listing claim:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    createListingClaim,
    getListingClaims,
    updateListingClaimStatus,
    getListingClaimById
  };
};

