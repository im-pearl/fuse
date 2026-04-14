import { useGameStore } from '@/store/gameStore';
import ko from './ko.json';
import en from './en.json';
import { Locale } from '@/types/game';

const messages: Record<Locale, typeof ko> = { ko, en };

type NestedKeyOf<T, K extends string = ''> = T extends object
  ? {
      [P in keyof T & string]: T[P] extends object
        ? NestedKeyOf<T[P], K extends '' ? P : `${K}.${P}`>
        : K extends ''
          ? P
          : `${K}.${P}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof ko>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function useTranslation() {
  const locale = useGameStore((s) => s.locale);

  function t(key: string, params?: Record<string, string>): string {
    let value = getNestedValue(messages[locale] as unknown as Record<string, unknown>, key);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, v);
      }
    }
    return value;
  }

  return { t, locale };
}
