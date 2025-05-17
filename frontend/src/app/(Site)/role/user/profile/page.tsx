import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import DefaultLayout from "@/components/Layouts/UserLayout";
import ProfileBox from "@/components/ProfileBox";
import UserProfileForm from "@/components/ProfileBox/UserProfileForm";

export const metadata: Metadata = {
  title: "Next.js Profile Page | NextAdmin - Next.js Dashboard Kit",
  description: "This is Next.js Profile page for NextAdmin Dashboard Kit",
};

const Profile = () => {
  return (
    <DefaultLayout>


        <UserProfileForm />
    </DefaultLayout>
  );
};

export default Profile;
