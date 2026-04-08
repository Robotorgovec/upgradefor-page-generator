import {
  getAccountType,
  getProfileCompletionLabel,
  isOnboardingComplete,
  requireAccountUser,
} from "../../account-data";
import ProfileSetupForm from "./profile-setup-form";

export default async function ProfileSetupPage() {
  const user = await requireAccountUser("/account/profile/setup");
  const onboardingComplete = isOnboardingComplete(user);

  return (
    <div className="account-page">
      <section className="account-card">
        <div className="account-page-header">
          <div>
            <p className="account-kicker">{onboardingComplete ? "Edit Profile" : "Complete Setup"}</p>
            <h1 className="account-page-title">
              {onboardingComplete ? "Edit profile" : "Finish your account setup"}
            </h1>
            <p className="account-page-description">
              Required fields are name and account type. Saving this form writes onboarding completion to the database
              and sends you to the dashboard.
            </p>
          </div>
        </div>

        {!onboardingComplete ? (
          <div className="account-banner">
            Complete the required fields to unlock the dashboard. Current completion status:{" "}
            {getProfileCompletionLabel(user)}.
          </div>
        ) : null}

        <ProfileSetupForm
          initialProfile={{
            displayName: user.profile?.displayName ?? "",
            role: getAccountType(user.role) ?? "",
            headline: user.profile?.headline ?? "",
            bio: user.profile?.bio ?? "",
            location: user.profile?.location ?? "",
            links: user.profile?.links ?? [],
          }}
          allowCancel={onboardingComplete}
          submitLabel={onboardingComplete ? "Save changes" : "Finish setup"}
        />
      </section>
    </div>
  );
}
