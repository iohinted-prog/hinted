import FeedClient from "./FeedClient";

export const metadata = {
  title: "Feed | Hinted.io",
  description: "Your Hinted feed with updates, reminders, and activity in one place.",
};

export default function FeedPage() {
  return <FeedClient />;
}
