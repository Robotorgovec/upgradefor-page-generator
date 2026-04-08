import Link from "next/link";
import { redirect } from "next/navigation";

import {
  formatMemberSince,
  getBio,
  getDisplayName,
  getHeadline,
  getInitials,
  getLinks,
  getLocation,
  getProfileCompletionLabel,
  getRoleLabel,
  getStatusLabel,
  isOnboardingComplete,
  requireAccountUser,
} from "../account-data";
import { LogoutButton } from "../logout-button";

export default async function AccountDashboardPage() {
  const user = await requireAccountUser("/account/dashboard");

  if (!isOnboardingComplete(user)) {
    redirect("/account/profile/setup");
  }

  const displayName = getDisplayName(user);
  const headline = getHeadline(user);
  const bio = getBio(user);
  const location = getLocation(user);
  const links = getLinks(user);
  const status = getStatusLabel(user);

  return (
    <div className="account-page">
      <section className="account-card">
        <div className="account-page-header">
          <div>
            <p className="account-kicker">My Account</p>
            <h1 className="account-page-title">Dashboard</h1>
            <p className="account-page-description">
              Your first-run setup is complete. This dashboard only shows actions that already work today.
            </p>
          </div>
          <nav className="account-nav" aria-label="Account navigation">
            <Link href="/account/dashboard" className="account-nav-link is-active">
              Dashboard
            </Link>
            <Link href="/account/profile" className="account-nav-link">
              Profile
            </Link>
          </nav>
        </div>

        <div className="account-hero">
          <div className="account-avatar" aria-label="Profile avatar">
            {user.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt={displayName || user.email} />
            ) : (
              <span>{getInitials(user)}</span>
            )}
          </div>
          <div className="account-hero-info">
            <h2>{displayName}</h2>
            <p>{headline || "Add a short headline to explain what you need or offer."}</p>
            <p>{getRoleLabel(user.role)}</p>
            {location ? <p>{location}</p> : null}
          </div>
        </div>

        <div className="account-section-actions">
          <Link className="btn" href="/account/profile/setup">
            Edit profile
          </Link>
          <Link className="btn btn--ghost" href="/account/profile">
            View profile
          </Link>
          <Link className="btn btn--ghost" href="/account/forgot">
            Reset password
          </Link>
          <LogoutButton />
        </div>
      </section>

      <section className="account-card">
        <h2 className="account-section-title">Account Overview</h2>
        <dl className="account-info-list">
          <div className="account-info-item">
            <dt>Name</dt>
            <dd>{displayName}</dd>
          </div>
          <div className="account-info-item">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="account-info-item">
            <dt>Account type</dt>
            <dd>{getRoleLabel(user.role)}</dd>
          </div>
          <div className="account-info-item">
            <dt>Status</dt>
            <dd>{status}</dd>
          </div>
          <div className="account-info-item">
            <dt>Profile completion</dt>
            <dd>{getProfileCompletionLabel(user)}</dd>
          </div>
        </dl>
      </section>

      <div className="account-grid">
        <section className="account-card">
          <h2 className="account-section-title">Profile Snapshot</h2>
          <p className={`account-copy ${bio ? "" : "account-placeholder"}`.trim()}>
            {bio || "No profile summary yet. Add one from the profile form if you want more context."}
          </p>
          <p className={`account-copy ${location ? "" : "account-placeholder"}`.trim()}>
            {location || "Location not added yet."}
          </p>
          <p className="account-copy">Member since {formatMemberSince(user.createdAt)}</p>
        </section>

        <section className="account-card">
          <h2 className="account-section-title">Quick Actions</h2>
          <div className="account-action-list">
            <Link className="account-action-card" href="/account/profile/setup">
              <strong>Edit profile</strong>
              <span>Update your name, account type, headline, location, and links.</span>
            </Link>
            <Link className="account-action-card" href="/account/profile">
              <strong>Review profile</strong>
              <span>Open the existing profile page and verify exactly what is saved.</span>
            </Link>
            <Link className="account-action-card" href="/account/forgot">
              <strong>Reset password</strong>
              <span>Use the current password reset flow for account security.</span>
            </Link>
          </div>
        </section>

        <section className="account-card">
          <h2 className="account-section-title">Profile Links</h2>
          {links.length ? (
            <ul className="account-link-list">
              {links.map((link) => (
                <li key={link}>
                  <a href={link} target="_blank" rel="noreferrer">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="account-placeholder">No profile links added yet.</p>
          )}

          {user.role === "provider" ? (
            <p className="account-copy">
              Provider setup is ready for future expansion, but no vendor route exists yet, so there is no dead link
              here.
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
