import Avatar, { genConfig } from "react-nice-avatar";
import type { InterviewerProfile } from "@/lib/config/interviewers";

interface InterviewerAvatarProps {
  interviewer: InterviewerProfile;
  size?: number;
  mouthStyle?: InterviewerProfile["avatarConfig"]["mouthStyle"];
}

export function InterviewerAvatar({
  interviewer,
  size = 40,
  mouthStyle,
}: InterviewerAvatarProps) {
  const config = genConfig(interviewer.id);

  const finalConfig = {
    ...config,
    ...interviewer.avatarConfig,
    ...(mouthStyle ? { mouthStyle } : {}),
  };

  return (
    <div key={interviewer.id} className={`avatar-${interviewer.id}`}>
      <Avatar
        style={{ width: `${size}px`, height: `${size}px` }}
        {...finalConfig}
      />
    </div>
  );
}
