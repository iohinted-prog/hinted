import Link from "next/link";

export const metadata = {
  title: "Hinted.io | Never forget. Always thoughtful.",
  description:
    "Hinted helps you remember important moments, save better gift ideas, build circles, and browse thoughtful picks.",
};

const hints = [
  {
    id: 1,
    title: "Noise-cancelling headphones",
    text: "amazon.co.uk · ~£120",
    image: "from-[#ead8cb] to-[#d6b39d]",
    tag: "Tech",
    rotate: "-rotate-1",
    starred: true,
  },
  {
    id: 2,
    title: "Weekend cabin stay",
    text: "airbnb.co.uk · Price varies",
    image: "from-[#efd7cf] to-[#dfb09e]",
    tag: "Travel",
    rotate: "rotate-1",
    starred: false,
  },
  {
    id: 3,
    title: "Cast-iron casserole dish",
    text: "johnlewis.com · ~£85",
    image: "from-[#e8e0d2] to-[#c9b79a]",
    tag: "Home",
    rotate: "-rotate-[0.6deg]",
    starred: false,
  },
  {
    id: 4,
    title: "Kindle or similar e-reader",
    text: "amazon.co.uk · ~£100",
    image: "from-[#dde7dc] to-[#adc0a8]",
    tag: "Books",
    rotate: "rotate-[0.8deg]",
    starred: false,
  },
  {
    id: 5,
    title: "Art print for the living room",
    text: "etsy.com · ~£40",
    image: "from-[#ecdcd4] to-[#d8b19f]",
    tag: "Home",
    rotate: "-rotate-[0.8deg]",
    starred: false,
  },
  {
    id: 6,
    title: "Nice pourover coffee set",
    text: "hasbean.co.uk · ~£60",
    image: "from-[#dce5df] to-[#b8c9c0]",
    tag: "Coffee",
    rotate: "rotate-[0.5deg]",
    starred: false,
  },
];

const calendarDays = [
  "25","26","27","28","29","30","31",
  "1","2","3","4","5","6","7",
  "8","9","10","11","12","13","14",
  "15","16","17","18","19","20","21",
  "22","23","24","25","26","27","28",
];

const reminders = [
  {
    title: "Sarah's Birthday",
    date: "June 29",
    colors: "from-[#efcdbf] to-[#c88c73]",
  },
  {
    title: "Mom & Dad Anniversary",
    date: "July 10",
    colors: "from-[#ead0c0] to-[#bf856d]",
  },
  {
    title: "James Promotion",
    date: "July 6",
    colors: "from-[#9cab86] to-[#5f7046]",
  },
];

const shopCards = [
  {
    id: 1,
    title: "Silk pillowcase set",
    text: "johnlewis.com · £45",
    image: "from-[#f1ddd5] to-[#ddb09f]",
    tag: "Beauty",
    rotate: "-rotate-[0.8deg]",
  },
  {
    id: 2,
    title: "Leather weekender",
    text: "arket.com · £129",
    image: "from-[#e8dfd2] to-[#ccb89b]",
    tag: "Travel",
    rotate: "rotate-[0.7deg]",
  },
  {
    id: 3,
    title: "Espresso cups",
    text: "etsy.com · £32",
    image: "from-[#dde7df] to-[#b5c6b7]",
    tag: "Home",
    rotate: "-rotate-[0.5deg]",
  },
];

function AvatarStack() {
  const avatars = [
    ["AB", "from-[#efcdbf] to-[#bb8168]"],
    ["JM", "from-[#dcc4b5] to-[#b78972]"],
    ["SL", "from-[#e7cab8] to-[#b97d66]"],
    ["PT", "from-[#98a47d] to-[#5f7046]"],
  ];

  return (
    <div className="flex items-center">
      {avatars.map(([label, colors], index) => (
        <div
          key={label}
          className={`-ml-2.5 flex h-10 w-10 items-center justify-center rounded-full border-[3px] border-[#fff8f4] bg-gradient-to-b text-[12px] font-bold text-white first:ml-0 ${colors}`}
          style={{ zIndex: avatars.length - index }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function MiniCard({ title, text, image, tag, rotate, starred = false }) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-[24px] border border-[#ece2db] bg-white shadow-sm transition-transform duration-200 hover:scale-[1.02] hover:shadow-md ${rotate}`}
    >
      <div className={`h-[112px] w-full bg-gradient-to-br ${image}`}>
        <div className="flex justify-end p-3">
          <div className="h-4 w-7 rounded-full bg-white/50" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-[13px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-[12px] text-slate-400">{text}</p>

        <div className="mt-2.5 flex items-center justify-between">
          <span className="rounded-full border border-slate-200 bg-[#faf9f7] px-2 py-0.5 text-[10px] font-medium text-slate-500">
            {tag}
          </span>
          <button
            type="button"
            className={`text-[16px] transition-transform duration-150 hover:scale-125 ${
              starred ? "text-[#f36f64]" : "text-slate-200 hover:text-[#f36f64]"
            }`}
            aria-label={starred ? "Unstar" : "Star"}
          >
            ★
          </button>
        </div>
      </div>
    </article>
  );
}

function CirclesTeaser() {
  const contributors = [
    ["CG", "from-[#efcdbf] to-[#bb8168]"],
    ["MF", "from-[#9cab86] to-[#5f7046]"],
    ["JM", "from-[#dcc4b5] to-[#b78972]"],
  ];

  return (
    <article className="rounded-[30px] border border-[#efdcd2] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8f9a78]">
            Circles
          </p>
          <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.04em] text-slate-900">
            Shared gifting
          </h3>
        </div>
        <div className="flex items-center">
          {contributors.map(([label, colors], index) => (
            <div
              key={label}
              
