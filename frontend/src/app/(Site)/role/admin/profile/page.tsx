import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";
import AdminLayout from "@/components/Layouts/AdminLayout";
import UserProfileForm from "@/components/ProfileBox/UserProfileForm";

export const metadata: Metadata = {
    title: "Next.js Profile Page | NextAdmin - Next.js Dashboard Kit",
    description: "This is Next.js Profile page for NextAdmin Dashboard Kit",
};

const Profile = () => {
    return (
        <AdminLayout>
            <UserProfileForm />
        </AdminLayout>
    );
};

export default Profile;
