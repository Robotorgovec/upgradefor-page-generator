import Link from "next/link";

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

export default async function AccountProfilePage() {
  const user = await requireAccountUser("/account/profile");
  const displayName = getDisplayName(user);
  const headline = getHeadline(user);
  const bio = getBio(user);
  const location = getLocation(user);
  const links = getLinks(user);
  const profileIsComplete = isOnboardingComplete(user);

  return (
    <div className="account-page">
      <section className="account-card">
        <div className="account-page-header">
          <div>
            <p className="account-kicker">Profile</p>
            <h1 className="account-page-title">Profile</h1>
            <p className="account-page-description">
              Review the account details currently stored in the database for this user.
            </p>
          </div>
          <nav className="account-nav" aria-label="Account navigation">
            <Link href="/account/dashboard" className="account-nav-link">
              Dashboard
            </Link>
            <Link href="/account/profile" className="account-nav-link is-active">
              Profile
            </Link>
          </nav>
        </div>

        {!profileIsComplete ? (
          <div className="account-banner">
            Setup is still incomplete. Finish the required fields to unlock the main dashboard flow.
          </div>
        ) : null}

        <div className="account-hero">
          <div className="account-avatar" aria-label="Profile avatar">
            {user.profile?.avatarUrl ? (
              <img src={user.profile.avatarUrl} alt={displayName || user.email} />
            ) : (
              <span>{getInitials(user)}</span>
            )}
          </div>
          <div className="account-hero-info">
            <h2>{displayName || "No name yet"}</h2>
            <p>{headline || "No headline added yet."}</p>
            <p>{getRoleLabel(user.role)}</p>
            {location ? <p>{location}</p> : null}
          </div>
        </div>

        <div className="account-section-actions">
          <Link className="btn" href="/account/profile/setup">
            {profileIsComplete ? "Edit profile" : "Complete setup"}
          </Link>
          {profileIsComplete ? (
            <Link className="btn btn--ghost" href="/account/dashboard">
              Back to dashboard
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </section>

      <section className="account-card">
        <h2 className="account-section-title">Profile</h2>
        <dl className="account-info-list">
          <div className="account-info-item">
            <dt>Name</dt>
            <dd className={displayName ? undefined : "account-placeholder"}>
              {displayName || "Not set yet"}
            </dd>
          </div>
          <div className="account-info-item">
            <dt>Account type</dt>
            <dd>{getRoleLabel(user.role)}</dd>
          </div>
          <div className="account-info-item">
            <dt>Headline</dt>
            <dd className={headline ? undefined : "account-placeholder"}>
              {headline || "Not set yet"}
            </dd>
          </div>
          <div className="account-info-item">
            <dt>Location</dt>
            <dd className={location ? undefined : "account-placeholder"}>
              {location || "Not set yet"}
            </dd>
          </div>
          <div className="account-info-item">
            <dt>Member since</dt>
            <dd>{formatMemberSince(user.createdAt)}</dd>
          </div>
        </dl>

        <div style={{ marginTop: 20 }}>
          <h3 className="account-section-title">About</h3>
          <p className={`account-copy ${bio ? "" : "account-placeholder"}`.trim()}>
            {bio || "No profile summary has been added yet."}
          </p>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 className="account-section-title">Links</h3>
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
            <p className="account-placeholder">No links added yet.</p>
          )}
        </div>
      </section>

      <section className="account-card">
        <h2 className="account-section-title">Account Overview</h2>
        <dl className="account-info-list">
          <div className="account-info-item">
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div className="account-info-item">
            <dt>Status</dt>
            <dd>{getStatusLabel(user)}</dd>
          </div>
          <div className="account-info-item">
            <dt>Profile completion</dt>
            <dd>{getProfileCompletionLabel(user)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
