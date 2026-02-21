import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Business } from '@/lib/businessService';
import { Building2, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

interface ClaimListingModalProps {
    business: Business;
    trigger?: React.ReactNode;
}

export const ClaimListingModal = ({ business, trigger }: ClaimListingModalProps) => {
    const { user, isSignedIn } = useUser();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [proofUrl, setProofUrl] = useState('');
    const [explanation, setExplanation] = useState('');

    const handleClaim = async () => {
        if (!isSignedIn) {
            toast({
                title: "Sign in required",
                description: "Please sign in to claim this business.",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from('business_claims')
                .insert({
                    business_id: business.id,
                    claimer_id: user.id,
                    claimer_name: user.fullName || user.username || 'User',
                    claimer_email: user.primaryEmailAddress?.emailAddress || '',
                    proof_url: proofUrl,
                    admin_notes: explanation,
                    status: 'pending'
                });

            if (error) throw error;

            toast({
                title: "Claim Submitted",
                description: "Your claim has been submitted for review. We will contact you soon.",
            });
            setIsOpen(false);
        } catch (error: any) {
            console.error('Error submitting claim:', error);
            toast({
                title: "Submission failed",
                description: error.message || "There was an error submitting your claim.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="w-full">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Claim this Listing
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] font-roboto">
                <DialogHeader>
                    <DialogTitle className="font-comfortaa flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-brand-blue" />
                        Claim {business.name}
                    </DialogTitle>
                    <DialogDescription>
                        Are you the owner or manager of this business? Submit a claim to manage your listing, respond to reviews, and upgrade to premium.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="proof">Proof of Ownership (Optional)</Label>
                        <Input
                            id="proof"
                            placeholder="Link to your website or identity document"
                            value={proofUrl}
                            onChange={(e) => setProofUrl(e.target.value)}
                            className="font-roboto"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="explanation">Tell us more</Label>
                        <Textarea
                            id="explanation"
                            placeholder="Any additional information to help us verify your claim."
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            className="font-roboto"
                        />
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md flex gap-2 text-sm text-blue-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>Verification usually takes 24-48 hours. Once approved, you'll get full dashboard access.</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleClaim}
                        disabled={isSubmitting}
                        className="bg-brand-blue text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Claim'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
