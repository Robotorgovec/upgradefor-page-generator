type ContactsCountryBlockProps = {
  sectionClassName?: string;
};

export default function ContactsCountryBlock({ sectionClassName }: ContactsCountryBlockProps) {
  const sectionClass = sectionClassName ? `section ${sectionClassName}` : "section";

  return (
    <section className={sectionClass} id="contacts">
      <div className="wrap">
        <h2>Контакты и выбор страны</h2>
        <div className="grid grid-2 mt-14 ai-start">
          <div className="card pad-16">
            <h3>Быстрый контакт</h3>
            <p className="muted">
              Телефон/мессенджер подставляется по стране. Если вы на глобальной странице — выберите
              регион ниже.
            </p>

            <div className="hr" />

            <div className="contact-line">
              <div className="icon" aria-hidden="true">
                ☎
              </div>
              <div>
                <b>{"{{PHONE_DISPLAY}}"}</b>
                <div className="note">Локальный номер для выбранной страны</div>
              </div>
            </div>

            <div className="contact-actions mt-10">
              <a className="btn" href="tel:{{PHONE_E164}}">
                Позвонить
              </a>
              <a className="btn btn-outline" href="https://wa.me/{{WHATSAPP_E164_NO_PLUS}}" rel="nofollow">
                WhatsApp
              </a>
            </div>

            <div className="hr" />

            <div className="note">
              Email: <a href="mailto:info@upgradefor.com">info@upgradefor.com</a>
            </div>
          </div>

          <div className="card pad-16">
            <h3>Выберите страну (локальные контакты)</h3>
            <p className="muted">
              На локальной странице будут: местный номер, валюта, язык и примеры кейсов по региону.
            </p>

            <ul className="geo-list mt-12">
              <li className="geo-item">
                <div>
                  <a href="{{URL_UAE}}">UAE • Dubai</a>
                  <div className="note">Английский/Арабский</div>
                </div>
                <div className="geo-phone">{"{{PHONE_UAE}}"}</div>
              </li>
              <li className="geo-item">
                <div>
                  <a href="{{URL_TURKEY}}">Türkiye</a>
                  <div className="note">Турецкий/Английский</div>
                </div>
                <div className="geo-phone">{"{{PHONE_TURKEY}}"}</div>
              </li>
              <li className="geo-item">
                <div>
                  <a href="{{URL_EU}}">EU</a>
                  <div className="note">English</div>
                </div>
                <div className="geo-phone">{"{{PHONE_EU}}"}</div>
              </li>
              <li className="geo-item">
                <div>
                  <a href="{{URL_CIS}}">CIS</a>
                  <div className="note">Русский</div>
                </div>
                <div className="geo-phone">{"{{PHONE_CIS}}"}</div>
              </li>
            </ul>

            <div className="note">*Номера/ссылки подставляются генератором в зависимости от страны и города.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
