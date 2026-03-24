"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import { RxLinkedinLogo } from "react-icons/rx";
import { Typography } from "@/components/common/atoms/typography";

type SocialLinks = {
  github: string | null;
  linkedin: string | null;
};

type LeaderboardEntry = {
  rank: number;
  username: string;
  xp: number;
  avatar: string;
  socials: SocialLinks;
};

type MonthData = {
  overall: readonly LeaderboardEntry[];
  gains: readonly LeaderboardEntry[];
};

const MONTH_KEYS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
] as const;

const DISPLAY_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const USERS = [
  {
    username: "vvar00o",
    avatar: "https://avatars.githubusercontent.com/u/47417165",
    socials: {
      github: "https://github.com/vvar00o",
      linkedin: "https://linkedin.com/in/vvar00o",
    },
  },
  {
    username: "SlickB",
    avatar: "https://github.com/tychoengberinkDIJ.png",
    socials: {
      github: "https://github.com/tychoengberinkDIJ",
      linkedin: null,
    },
  },
  {
    username: "MatJakubowski",
    avatar: "https://github.com/Jakubowski1.png",
    socials: {
      github: "https://github.com/Jakubowski1",
      linkedin: "https://www.linkedin.com/in/mateusz-jakubowski-334827239/",
    },
  },
  {
    username: "Aleksander S.",
    avatar: "https://github.com/xolekk.png",
    socials: {
      github: "https://github.com/xolekk",
      linkedin: "https://uk.linkedin.com/in/aleksander-stroinski-391272202",
    },
  },
  {
    username: "David U.",
    avatar: "https://github.com/HackHunter8.png",
    socials: {
      github: "https://github.com/HackHunter8",
      linkedin: "https://www.linkedin.com/in/david-u-4642662a7/",
    },
  },
] as const;

const LEADERBOARD_DATA: Record<(typeof MONTH_KEYS)[number], MonthData> = {
  january: {
    overall: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 64210,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[1].username,
        xp: 61890,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 3,
        username: USERS[2].username,
        xp: 59740,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 4,
        username: USERS[3].username,
        xp: 57300,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 54820,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 4210,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 3740,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[1].username,
        xp: 3590,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 4,
        username: USERS[3].username,
        xp: 3100,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 2820,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
  },
  february: {
    overall: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 68950,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 64120,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[1].username,
        xp: 63780,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 4,
        username: USERS[3].username,
        xp: 61450,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 58210,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 4740,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 4380,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 4150,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[4].username,
        xp: 3390,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 1890,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  march: {
    overall: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 73400,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 69510,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[1].username,
        xp: 66200,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 4,
        username: USERS[3].username,
        xp: 65890,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 62750,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5390,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[4].username,
        xp: 4540,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 3,
        username: USERS[0].username,
        xp: 4450,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 4,
        username: USERS[3].username,
        xp: 4440,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 2420,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  april: {
    overall: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 77120,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 74830,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 70210,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 69100,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 66390,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5320,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[3].username,
        xp: 4320,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 3,
        username: USERS[0].username,
        xp: 3720,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 4,
        username: USERS[4].username,
        xp: 3640,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 2900,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  may: {
    overall: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 81540,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 79680,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 75430,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 72540,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 70010,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[3].username,
        xp: 5220,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 4850,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[0].username,
        xp: 4420,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 4,
        username: USERS[4].username,
        xp: 3620,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 3440,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  june: {
    overall: [
      {
        rank: 1,
        username: USERS[0].username,
        xp: 85870,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 2,
        username: USERS[2].username,
        xp: 84920,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 80100,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 76340,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 73520,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5240,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[3].username,
        xp: 4670,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 3,
        username: USERS[0].username,
        xp: 4330,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 3800,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 3510,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
  },
  july: {
    overall: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 90680,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 90210,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 84540,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 80120,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 77350,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5760,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[3].username,
        xp: 4440,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 3,
        username: USERS[0].username,
        xp: 4340,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 4,
        username: USERS[4].username,
        xp: 3830,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 3780,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  august: {
    overall: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 95900,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 94750,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 89100,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 84560,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 81210,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5220,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[3].username,
        xp: 4560,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 3,
        username: USERS[0].username,
        xp: 4540,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 4440,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 3860,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
  },
  september: {
    overall: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 101340,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 99120,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 93670,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 88340,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 85540,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5440,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[3].username,
        xp: 4570,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 3,
        username: USERS[4].username,
        xp: 4330,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 4,
        username: USERS[0].username,
        xp: 4370,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 3780,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  october: {
    overall: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 106890,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 103850,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 98340,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 92780,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 89870,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5550,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 4730,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 4670,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 4440,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 4330,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
  },
  november: {
    overall: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 112450,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 108210,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 102890,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 97120,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 94560,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5560,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[4].username,
        xp: 4690,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 4550,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[0].username,
        xp: 4360,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 5,
        username: USERS[1].username,
        xp: 4340,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
    ],
  },
  december: {
    overall: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 117780,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[0].username,
        xp: 112640,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 3,
        username: USERS[3].username,
        xp: 107450,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 4,
        username: USERS[1].username,
        xp: 101560,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 98890,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
    gains: [
      {
        rank: 1,
        username: USERS[2].username,
        xp: 5330,
        avatar: USERS[2].avatar,
        socials: USERS[2].socials,
      },
      {
        rank: 2,
        username: USERS[3].username,
        xp: 4560,
        avatar: USERS[3].avatar,
        socials: USERS[3].socials,
      },
      {
        rank: 3,
        username: USERS[1].username,
        xp: 4440,
        avatar: USERS[1].avatar,
        socials: USERS[1].socials,
      },
      {
        rank: 4,
        username: USERS[0].username,
        xp: 4430,
        avatar: USERS[0].avatar,
        socials: USERS[0].socials,
      },
      {
        rank: 5,
        username: USERS[4].username,
        xp: 4330,
        avatar: USERS[4].avatar,
        socials: USERS[4].socials,
      },
    ],
  },
};

function SocialIcon({
  href,
  icon: Icon,
  label,
}: {
  href: string | null;
  icon: typeof FaGithub | typeof RxLinkedinLogo;
  label: string;
}) {
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="text-muted-foreground hover:text-primary transition-colors"
      >
        <Icon className="size-5" aria-hidden="true" />
      </a>
    );
  }
  return (
    <Icon className="size-5 text-muted-foreground/20" aria-hidden="true" />
  );
}

function LeaderboardTable({
  entries,
  xpLabel,
}: {
  entries: readonly LeaderboardEntry[];
  xpLabel: string;
}) {
  // Show only top 3 entries
  const topEntries = entries.slice(0, 3);

  return (
    <div className="overflow-hidden rounded-md">
      <table className="w-full" aria-label={`Leaderboard: ${xpLabel}`}>
        <thead>
          <tr className="border-b border-border/30">
            <th scope="col" className="text-left p-3">
              <Typography.BodyBold>User</Typography.BodyBold>
            </th>
            <th scope="col" className="text-left p-3">
              <Typography.BodyBold>{xpLabel}</Typography.BodyBold>
            </th>
            <th scope="col" className="text-right p-3">
              <Typography.BodyBold>Links</Typography.BodyBold>
            </th>
          </tr>
        </thead>
        <tbody>
          {topEntries.map((entry) => (
            <tr
              key={entry.rank}
              className="border-b border-border/20 hover:bg-background/50 transition-colors"
            >
              <th scope="row" className="p-3 text-left font-normal">
                <div className="flex items-center gap-3">
                  <Image
                    src={entry.avatar}
                    alt={`${entry.username} avatar`}
                    width={32}
                    height={32}
                    className="size-8 rounded-full object-cover shrink-0"
                    unoptimized
                  />
                  <Typography.Body>{entry.username}</Typography.Body>
                </div>
              </th>
              <td className="p-3 text-left">
                <Typography.BodyBold color="primary">
                  {entry.xp.toLocaleString()}
                </Typography.BodyBold>
              </td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-2">
                  <SocialIcon
                    href={entry.socials.github}
                    icon={FaGithub}
                    label={`${entry.username} GitHub profile`}
                  />
                  <SocialIcon
                    href={entry.socials.linkedin}
                    icon={RxLinkedinLogo}
                    label={`${entry.username} LinkedIn profile`}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getPreviousMonthIndex(): number {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return prev.getMonth();
}

export default function MonthlyAwardsSection({
  className = "",
}: {
  className?: string;
}) {
  const [monthIndex, setMonthIndex] = useState<number | null>(null);

  useEffect(() => {
    setMonthIndex(getPreviousMonthIndex());
  }, []);

  if (monthIndex === null) return null;

  const monthKey = MONTH_KEYS[monthIndex];
  const monthName = DISPLAY_MONTH_NAMES[monthIndex];
  const data = LEADERBOARD_DATA[monthKey];

  return (
    <section
      className={`bg-card border-b border-border/40 py-16 sm:py-20 scroll-mt-24 relative overflow-hidden ${className}`}
      aria-labelledby="monthly-awards-heading"
      data-analytics-id="home-monthly-awards"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(251,146,60,0.06),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <header className="text-center mb-12 sm:mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Typography.HeroSubHeading id="monthly-awards-heading">
              {monthName} Awards
            </Typography.HeroSubHeading>
          </div>
          <Typography.Body color="secondary" className="max-w-2xl mx-auto">
            Celebrating our top performers. See who's leading the pack.
          </Typography.Body>
        </header>

        <div className="grid lg:grid-cols-2 gap-12 sm:gap-16">
          <div>
            <Typography.BodyBold className="mb-8 text-center">
              Score Leaders
            </Typography.BodyBold>
            <LeaderboardTable entries={data.overall} xpLabel="Score" />
          </div>

          <div>
            <Typography.BodyBold className="mb-8 text-center">
              Monthly Score Gains
            </Typography.BodyBold>
            <LeaderboardTable entries={data.gains} xpLabel="Gained" />
          </div>
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Typography.Body color="secondary" className="max-w-2xl mx-auto">
            Ready to climb the leaderboard? Start practicing and see your name
            here next month.
          </Typography.Body>
        </div>
      </div>
    </section>
  );
}
