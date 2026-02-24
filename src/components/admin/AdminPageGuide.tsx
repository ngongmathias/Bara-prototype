import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface AdminPageGuideProps {
    title: string;
    description: string;
    features: string[];
    workflow?: string[];
}

export function AdminPageGuide({ title, description, features, workflow }: AdminPageGuideProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-8 ml-4 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800">
                    <Info className="h-4 w-4" />
                    Page Guide & Workflow
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        {title} - Admin Guide
                    </DialogTitle>
                    <DialogDescription className="text-base text-gray-700 mt-2">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm">✓</span>
                            Key Systems & Features
                        </h4>
                        <ul className="space-y-2">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex gap-2 text-sm text-gray-700">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {workflow && workflow.length > 0 && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">→</span>
                                Standard Workflow
                            </h4>
                            <ol className="space-y-3">
                                {workflow.map((step, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm text-gray-700">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <span className="pt-0.5">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}

                    <div className="text-xs text-gray-500 bg-blue-50/50 p-3 rounded text-center">
                        This guide is intended for administrators to understand the purpose and mechanisms of this moderation page.
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
