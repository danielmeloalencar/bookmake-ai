import { cn } from "@/lib/utils";
import { BookMarked, Wand2, type LucideProps } from "lucide-react";

export function Logo({ className, ...props }: LucideProps) {
    return (
        <div className={cn("relative", className)}>
            <BookMarked className="h-full w-full" {...props} />
            <Wand2 className="absolute -bottom-1 -right-1 h-2/3 w-2/3 text-accent" strokeWidth={2.5} />
        </div>
    )
}
