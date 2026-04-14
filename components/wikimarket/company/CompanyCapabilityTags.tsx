import styles from "./CompanyProfilePage.module.css";

type CompanyCapabilityTagsProps = {
  capabilities: string[];
};

export default function CompanyCapabilityTags({ capabilities }: CompanyCapabilityTagsProps) {
  if (capabilities.length === 0) {
    return null;
  }

  return (
    <ul className={styles.capabilityList}>
      {capabilities.map((capability) => (
        <li key={capability}>{capability}</li>
      ))}
    </ul>
  );
}
