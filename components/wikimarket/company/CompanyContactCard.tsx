"use client";

import { useMemo, useState } from "react";

import type { CompanyContacts } from "../../../lib/wikimarket/company-types";
import InquiryForm from "./InquiryForm";
import styles from "./CompanyContactCard.module.css";

type CompanyContactCardProps = {
  companySlug: string;
  companyName: string;
  contacts: CompanyContacts;
  responseSpeedLabel?: string;
};

type ContactLink = {
  label: string;
  href: string;
};

export default function CompanyContactCard({
  companySlug,
  companyName,
  contacts,
  responseSpeedLabel,
}: CompanyContactCardProps) {
  const [showContacts, setShowContacts] = useState(false);

  const contactLinks = useMemo<ContactLink[]>(() => {
    const items: ContactLink[] = [];

    if (contacts.email) {
      items.push({ label: contacts.email, href: `mailto:${contacts.email}` });
    }

    if (contacts.phone) {
      items.push({ label: contacts.phone, href: `tel:${contacts.phone}` });
    }

    if (contacts.whatsapp) {
      items.push({ label: "WhatsApp", href: contacts.whatsapp });
    }

    if (contacts.telegram) {
      items.push({ label: "Telegram", href: contacts.telegram });
    }

    return items;
  }, [contacts.email, contacts.phone, contacts.telegram, contacts.whatsapp]);

  return (
    <section className={styles.card} id="inquiry">
      <div className={styles.header}>
        <p className={styles.kicker}>Contact / RFQ</p>
        <h2>Связаться с компанией</h2>
        <p className={styles.copy}>
          Запрос уходит в защищенный inquiry flow. Подходит для КП, replacement, OEM и уточнения сроков.
        </p>
      </div>

      {responseSpeedLabel ? <p className={styles.responseBadge}>{responseSpeedLabel}</p> : null}

      <button className={styles.revealButton} type="button" onClick={() => setShowContacts((current) => !current)}>
        {showContacts ? "Скрыть контакты" : "Показать контакты"}
      </button>

      {showContacts ? (
        contactLinks.length > 0 ? (
          <ul className={styles.contactList}>
            {contactLinks.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.contactNote}>Публичные прямые контакты скрыты. Используйте форму ниже для первого запроса.</p>
        )
      ) : null}

      {contacts.formEnabled ? <InquiryForm companySlug={companySlug} companyName={companyName} /> : null}
    </section>
  );
}
