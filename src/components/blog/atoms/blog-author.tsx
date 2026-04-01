import Image from "next/image";
import { Typography } from "@/components/common/atoms/typography";

interface BlogAuthorProps {
  name: string;
  avatar?: string | null;
}

export function BlogAuthor({ name, avatar }: BlogAuthorProps) {
  return (
    <div className="flex items-center gap-2">
      {avatar ? (
        <Image
          src={avatar}
          alt={`${name}'s avatar`}
          width={24}
          height={24}
          className="rounded-full"
        />
      ) : (
        <div
          className="size-6 rounded-full bg-primary/10 flex items-center justify-center"
          aria-hidden="true"
        >
          <Typography.SubCaptionBold>
            {name.charAt(0).toUpperCase()}
          </Typography.SubCaptionBold>
        </div>
      )}
      <Typography.SubCaptionMedium color="secondary">
        {name}
      </Typography.SubCaptionMedium>
    </div>
  );
}
