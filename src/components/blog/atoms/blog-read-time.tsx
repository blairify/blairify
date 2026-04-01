import { Clock } from "lucide-react";
import { Typography } from "@/components/common/atoms/typography";

interface BlogReadTimeProps {
  minutes: number;
}

export function BlogReadTime({ minutes }: BlogReadTimeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Clock className="size-3.5" aria-hidden="true" />
      <Typography.SubCaption color="secondary">
        {minutes} min read
      </Typography.SubCaption>
    </div>
  );
}
