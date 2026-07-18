import ProfileClient from "./ProfileClient";

export default async function ProfilePage({ params }) {
  const { userId } = await params;
  return <ProfileClient userId={userId} />;
}
