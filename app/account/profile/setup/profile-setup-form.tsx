"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProfileFormData = {
  displayName: string;
  role: "" | "customer" | "provider";
  headline: string;
  bio: string;
  location: string;
  links: string[];
};

type FieldErrors = Partial<Record<keyof ProfileFormData, string>>;

const MAX_LINKS = 3;
const ACCOUNT_TYPE_OPTIONS = [
  {
    value: "customer" as const,
    label: "Customer",
    description: "I am looking for products, partners, or services.",
  },
  {
    value: "provider" as const,
    label: "Provider",
    description: "I provide products or services and want a business-facing profile.",
  },
] as const;

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProfileSetupForm({
  initialProfile,
  allowCancel,
  submitLabel,
}: {
  initialProfile: ProfileFormData;
  allowCancel: boolean;
  submitLabel: string;
}) {
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [role, setRole] = useState<ProfileFormData["role"]>(initialProfile.role);
  const [headline, setHeadline] = useState(initialProfile.headline);
  const [bio, setBio] = useState(initialProfile.bio);
  const [location, setLocation] = useState(initialProfile.location);
  const [links, setLinks] = useState(() =>
    [...initialProfile.links, "", "", ""].slice(0, MAX_LINKS)
  );

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const trimmedLinks = useMemo(() => links.map((link) => link.trim()).filter(Boolean), [links]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!displayName.trim() || displayName.trim().length < 2) {
      nextErrors.displayName = "Enter a name with at least 2 characters.";
    }

    if (!role) {
      nextErrors.role = "Choose whether this account is for a customer or a provider.";
    }

    if (trimmedLinks.length > MAX_LINKS) {
      nextErrors.links = "You can add up to 3 links.";
    }

    if (trimmedLinks.some((link) => !isValidUrl(link))) {
      nextErrors.links = "Links must start with http:// or https://.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage(null);
    setErrors({});

    if (!validate()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          role,
          headline: headline.trim(),
          bio: bio.trim(),
          location: location.trim(),
          links: trimmedLinks,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        redirectTo?: string;
        fieldErrors?: FieldErrors;
      } | null;

      if (!response.ok) {
        if (payload?.fieldErrors) {
          setErrors(payload.fieldErrors);
        }

        setFormMessage({
          type: "error",
          text: payload?.message || "Could not save the profile.",
        });
        return;
      }

      setFormMessage({ type: "success", text: payload?.message || "Profile saved." });
      setTimeout(() => {
        window.location.assign(payload?.redirectTo || "/account/dashboard");
      }, 600);
    } catch {
      setFormMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-form" onSubmit={onSubmit}>
      {formMessage ? <p className={`form-message ${formMessage.type}`}>{formMessage.text}</p> : null}

      <div>
        <label htmlFor="displayName">Name</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          disabled={saving}
          required
        />
        {errors.displayName ? <p className="field-error">{errors.displayName}</p> : null}
      </div>

      <div>
        <label>Account type</label>
        <div className="account-choice-grid">
          {ACCOUNT_TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`account-choice-card ${role === option.value ? "is-selected" : ""}`}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                disabled={saving}
              />
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </label>
          ))}
        </div>
        {errors.role ? <p className="field-error">{errors.role}</p> : null}
      </div>

      <div>
        <label htmlFor="headline">Headline</label>
        <input
          id="headline"
          type="text"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label htmlFor="bio">About</label>
        <textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} disabled={saving} />
      </div>

      <div>
        <label htmlFor="location">Location</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label>Links (up to 3)</label>
        <div className="account-links">
          {links.map((link, index) => (
            <input
              key={`link-${index}`}
              type="url"
              placeholder="https://..."
              value={link}
              disabled={saving}
              onChange={(event) => {
                const nextLinks = [...links];
                nextLinks[index] = event.target.value;
                setLinks(nextLinks);
              }}
            />
          ))}
        </div>
        {errors.links ? <p className="field-error">{errors.links}</p> : null}
      </div>

      <div className="account-form-actions">
        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Saving..." : submitLabel}
        </button>
        {allowCancel ? (
          <Link className="btn btn--ghost" href="/account/dashboard">
            Cancel
          </Link>
        ) : null}
      </div>
    </form>
  );
}
