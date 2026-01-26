"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ProfileFormData = {
  displayName: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  location: string;
  links: string[];
};

type FieldErrors = Partial<Record<keyof ProfileFormData, string>>;

const MAX_LINKS = 3;

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProfileSetupForm({ initialProfile }: { initialProfile: ProfileFormData }) {
  const [displayName, setDisplayName] = useState(initialProfile.displayName);
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatarUrl);
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
  const [uploading, setUploading] = useState(false);

  const trimmedLinks = useMemo(() => links.map((link) => link.trim()).filter(Boolean), [links]);

  const validate = () => {
    const nextErrors: FieldErrors = {};

    if (!displayName.trim() || displayName.trim().length < 2) {
      nextErrors.displayName = "Введите имя минимум из 2 символов.";
    }

    if (trimmedLinks.length > MAX_LINKS) {
      nextErrors.links = "Можно добавить не больше 3 ссылок.";
    }

    if (trimmedLinks.some((link) => !isValidUrl(link))) {
      nextErrors.links = "Проверьте, что ссылки начинаются с http:// или https://.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFormMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/account/avatar", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as { avatarUrl?: string; message?: string };

      if (!response.ok || !payload?.avatarUrl) {
        setFormMessage({
          type: "error",
          text: payload?.message || "Не удалось загрузить аватар.",
        });
        return;
      }

      setAvatarUrl(payload.avatarUrl);
      setFormMessage({ type: "success", text: "Аватар обновлён." });
    } catch {
      setFormMessage({ type: "error", text: "Ошибка сети при загрузке аватара." });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormMessage(null);

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
          headline: headline.trim(),
          bio: bio.trim(),
          location: location.trim(),
          links: trimmedLinks,
          avatarUrl: avatarUrl || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { message?: string };

      if (!response.ok) {
        setFormMessage({
          type: "error",
          text: payload?.message || "Не удалось сохранить профиль.",
        });
        return;
      }

      setFormMessage({ type: "success", text: "Профиль сохранён." });
      setTimeout(() => {
        window.location.href = "/account";
      }, 600);
    } catch {
      setFormMessage({ type: "error", text: "Ошибка сети. Попробуйте ещё раз." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="account-form" onSubmit={onSubmit}>
      {formMessage ? (
        <p className={`form-message ${formMessage.type}`}>{formMessage.text}</p>
      ) : null}

      <div>
        <label htmlFor="avatar">Аватар</label>
        <div className="account-avatar-upload">
          <div className="account-avatar" aria-label="Превью аватара">
            {avatarUrl ? <img src={avatarUrl} alt="Аватар" /> : <span>UP</span>}
          </div>
          <input
            id="avatar"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>
      </div>

      <div>
        <label htmlFor="displayName">Имя или ник</label>
        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          required
        />
        {errors.displayName ? <p className="field-error">{errors.displayName}</p> : null}
      </div>

      <div>
        <label htmlFor="headline">Короткая подпись</label>
        <input
          id="headline"
          type="text"
          value={headline}
          onChange={(event) => setHeadline(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="bio">О себе</label>
        <textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} />
      </div>

      <div>
        <label htmlFor="location">Город или страна</label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
        />
      </div>

      <div>
        <label>Ссылки (до 3)</label>
        <div className="account-links">
          {links.map((link, index) => (
            <input
              key={`link-${index}`}
              type="url"
              placeholder="https://..."
              value={link}
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
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
        <Link className="btn btn--ghost" href="/account">
          Отмена
        </Link>
      </div>
    </form>
  );
}
