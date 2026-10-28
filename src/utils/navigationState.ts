export const normalizeTabName = (rawTab: string | null | undefined): string => {
  if (!rawTab) return '';
  return rawTab.trim().toLowerCase().replace(/^#\/?/, '').split('?')[0];
};

export interface ResolveTabOptions {
  urlTab?: string | null;
  hashTab?: string | null;
  storedTab?: string | null;
  isManager: boolean;
  allowedTabs?: string[];
  defaultAdminTab?: string;
  defaultEmployeeTab?: string;
}

export const resolveActiveTab = ({
  urlTab,
  hashTab,
  storedTab,
  isManager,
  allowedTabs,
  defaultAdminTab = 'reports',
  defaultEmployeeTab = 'tasks'
}: ResolveTabOptions): string => {
  const candidate =
    normalizeTabName(urlTab) ||
    normalizeTabName(hashTab) ||
    normalizeTabName(storedTab);

  if (candidate && candidate !== 'login') {
    if (isManager) {
      return candidate;
    }
    if (allowedTabs && allowedTabs.includes(candidate)) {
      return candidate;
    }
  }

  return isManager ? defaultAdminTab : defaultEmployeeTab;
};
