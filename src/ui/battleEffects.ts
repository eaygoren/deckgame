import { EffectType, SkillEffect } from "../shared/interfaces/skillInterfaces";

interface EffectBadge {
  label: string;
  path: string;
}

export const clockIconPath = "M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z";

export const effectBadges: Partial<Record<EffectType, EffectBadge>> = {
  [EffectType.VoidLock]: { label: "Void engeli", path: "M12 3 21 12 12 21 3 12Z M8 8l8 8" },
  [EffectType.PhoenixEgg]: { label: "Phoenix yumurtası", path: "M12 3c-3.3 0-7 6.2-7 11a7 7 0 0 0 14 0c0-4.8-3.7-11-7-11Z" },
  [EffectType.SkillCopy]: { label: "Yetenek kopyası", path: "M8 8h12v12H8ZM16 4H4v12" },
  [EffectType.Freeze]: { label: "Donma", path: "M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 3 3-3m-6 16 3-3 3 3" },
  [EffectType.Protection]: { label: "Koruma", path: "M12 3 20 6v5c0 4.5-2.8 7.8-8 10-5.2-2.2-8-5.5-8-10V6l8-3Z M8 12l3 3 5-5" },
  [EffectType.Bleed]: { label: "Kanama", path: "M12 3c-2.4 3.4-6 7.2-6 11a6 6 0 0 0 12 0c0-3.8-3.6-7.6-6-11Z M9 15a3 3 0 0 0 3 3" },
  [EffectType.Burn]: { label: "Yanma", path: "M12 22c-4.1 0-7-2.7-7-6.7 0-2.5 1.3-4.8 3.3-6.3-.2 2.1.7 3.2 1.4 3.5C12.2 9.5 13.1 6 12.2 2c4.6 3.5 6.8 8.8 6.8 13.3 0 4-2.9 6.7-7 6.7Z" },
  [EffectType.Poison]: { label: "Zehir", path: "M9 3h6m-5 0v6l-4 4a3 3 0 0 0-1 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a3 3 0 0 0-1-2l-4-4V3M9 15l6 3m0-3-6 3" },
  [EffectType.Silence]: { label: "Susturma", path: "M9 4h9a3 3 0 0 1 3 3v8a3 3 0 0 1-2 2.8M4.6 5A3 3 0 0 0 3 7v8a3 3 0 0 0 3 3h1v3l4-3h3M3 3l18 18" },
  [EffectType.AttackReduction]: { label: "Saldırı düşüşü", path: "m4 19 4-4m-3-2 6 6m-3-4L18 5h3v3L11 18m9-4v7m-3-3 3 3 3-3" },
  [EffectType.Mark]: { label: "İşaret", path: "M12 2v4m0 12v4M2 12h4m12 0h4M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" },
  [EffectType.Taunt]: { label: "Kışkırtma", path: "M12 2v14m0 4v2" },
  [EffectType.ZombifyPending]: { label: "Enfeksiyon", path: "M18 12a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM12 6V3m0 18v-3M6 12H3m18 0h-3M7.8 7.8 5.5 5.5m13 13-2.3-2.3m0-8.4 2.3-2.3m-13 13 2.3-2.3M10 10h.1m3.9 1h.1m-2.1 3h.1" },
  [EffectType.Zombify]: { label: "Zombileşme", path: "M12 3a8 8 0 0 0-5 14.2V21h10v-3.8A8 8 0 0 0 12 3ZM8 11l2 2m0-2-2 2m6-2 2 2m0-2-2 2m-2 5v3" },
  [EffectType.WarriorRage]: { label: "Öfke", path: "M5 12V8a2 2 0 0 1 4 0V5a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v2a2 2 0 0 1 4 0v4l-3 5v3H8v-3l-4-4a2 2 0 0 1 2.8-2.8L9 13m5-4-2 3 3 1-2 3" },
  [EffectType.Invisible]: { label: "Görünmezlik", path: "M3 3l18 18M10.6 5.1C16 4 20.3 8.2 22 12a16 16 0 0 1-2.7 3.8M6.2 7.2A15 15 0 0 0 2 12c2.3 4.2 6 7 10 7a10 10 0 0 0 4.8-1.3M9.9 9.9a3 3 0 0 0 4.2 4.2" },
};

export function createEffectBadge(badge?: EffectBadge): HTMLSpanElement {
  const element = document.createElement("span");
  element.className = "effect-badge";
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(namespace, "path");
  path.setAttribute("d", badge?.path ?? "M12 8v4m0 4h.01");
  icon.append(path);
  element.append(icon);
  return element;
}

export function effectDuration(effect: SkillEffect): string {
  if (effect.type === EffectType.Protection) return "Kendi sonraki turu başlayana kadar";
  if (effect.type === EffectType.Invisible) return "Rakibin sonraki turu bitene kadar";
  if (effect.type === EffectType.Mark) return "İşaretleyen tarafın sonraki turunun sonuna kadar";
  if (effect.duration === Infinity) return "Süresiz";
  return effect.duration + " tur kaldı";
}

export function effectDetails(effect: SkillEffect): string {
  switch (effect.type) {
    case EffectType.VoidLock:
      return "Kart can yenileyemez ve saldırı veya can güçlendirmesi alamaz.";
    case EffectType.PhoenixEgg:
      return "Yumurta saldırı ve karşı saldırı yapamaz. Süre sonunda hayattaysa Phoenix yeniden doğar.";
    case EffectType.Bleed:
    case EffectType.Burn:
    case EffectType.Poison:
      return `Kartın turu sonunda ${effect.value || 1} hasar.`;
    case EffectType.Freeze:
      return "Kart saldıran olarak seçilemez ve karşı saldırı yapamaz.";
    case EffectType.Protection:
      return effect.protector && effect.protector.health > 0
        ? effect.protector.name + " savaş hasarının yarısını üstlenir."
        : "Koruyucu düştüğü için hasar paylaşımı sona erdi.";
    case EffectType.Mark:
      return "Normal saldırılardan %50 daha fazla hasar alır.";
    case EffectType.Taunt:
      return effect.source ? "Kart yalnızca " + effect.source.name + " hedefine saldırabilir." : "";
    case EffectType.ZombifyPending:
      return "Kart geri sayım boyunca yeteneklerini kullanabilir. Süre bitince kalıcı olarak Zombie olur.";
    case EffectType.Zombify:
      return "Yeteneksiz Zombie. Karakter ve sınıf yeteneği kullanamaz.";
    case EffectType.Silence:
      return "Kart özel yeteneğini kullanamaz.";
    case EffectType.SkillCopy:
      return `${effect.copiedSkill?.name ?? "Kopyalanan yetenek"} koşulu sağlanırsa sonraki normal saldırıda çalışır.`;
    case EffectType.AttackReduction:
      return `Saldırı gücü %${Math.floor((effect.value || 0.5) * 100)} azaldı.`;
    case EffectType.WarriorRage:
      return effect.value === undefined ? "Saldırı gücü artar." : `Saldırı gücü +${effect.value}.`;
    case EffectType.Invisible:
      return "Kart saldırıyla hedef alınamaz ve karşı hasar almaz.";
    default:
      return "";
  }
}
