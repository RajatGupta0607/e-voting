import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import ProfileForm from "~/components/ProfileForm";

async function Page() {
  const session = await auth();

  if (!session?.user.id) {
    redirect("/login");
  }

  if (session.user.profileComplete) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fffce9] to-[#ffe8c2] text-white">
      <div className="shadow-input mx-auto w-full max-w-md rounded-none bg-white p-4 md:rounded-2xl md:p-8 dark:bg-black">
        <h2 className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
          Complete Your Profile
        </h2>
        <p className="mt-2 max-w-sm text-sm text-neutral-600 dark:text-neutral-300">
          Please Fill in the required details to complete your profile.
        </p>

        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />

        <ProfileForm />
      </div>
    </main>
  );
}

export default Page;
