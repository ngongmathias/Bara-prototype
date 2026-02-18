import { MainLayout } from '@/components/layout/MainLayout';
import { StreamsSidebar } from './StreamsSidebar';

export function StreamsLayout({ children }: { children: React.ReactNode }) {
    return (
        <MainLayout>
            <div className="flex min-h-[calc(100vh-64px)] bg-black">
                <StreamsSidebar className="w-64 flex-shrink-0 hidden lg:flex border-r border-gray-800 sticky top-0 h-[calc(100vh-64px)] overflow-y-auto" />
                <div className="flex-grow min-w-0 bg-gradient-to-b from-gray-900 to-black">
                    {children}
                </div>
            </div>
        </MainLayout>
    );
}
