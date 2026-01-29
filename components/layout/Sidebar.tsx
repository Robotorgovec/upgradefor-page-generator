"use client";

import Link from "next/link";

type SidebarProps = {
  onClose: () => void;
};

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Основная навигация">
      <div className="sidebar-inner">
        <div className="sidebar-section">
          <p className="sidebar-section-title">Навигация</p>
          <Link className="sidebar-link" href="/">
            Главная
          </Link>
          <Link className="sidebar-link" href="/catalog">
            Каталог
          </Link>
          <Link className="sidebar-link" href="/account">
            Аккаунт
          </Link>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-section-title">Сервисы</p>
          <Link className="sidebar-link" href="/messages">
            Сообщения
          </Link>
          <Link className="sidebar-link" href="/assistant">
            ИИ-ассистент
          </Link>
        </div>
        <div className="sidebar-section">
          <p className="sidebar-section-title">WikiMarket</p>
          <Link className="sidebar-link" href="/wikimarket/categories">
            Категории
          </Link>
          <Link className="sidebar-link" href="/wikimarket/domains/fio-rus">
            Домены
          </Link>
        </div>
        <button className="sidebar-link" type="button" onClick={onClose}>
          Свернуть меню
        </button>
      </div>
    </aside>
  );
}
