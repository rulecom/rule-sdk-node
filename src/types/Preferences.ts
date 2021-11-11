interface GroupPreference {
  id: number;
  name: string;
  fallback_opt_in: boolean;
}

interface SubscriberPreference {
  preference_id: number;
  name?: string;
  is_opted_in: boolean;
}

interface GroupOptions {
  preference_group_id: number;
  identifier: string | number;
  identified_by?: "phone_number" | "id" | "email";
}

interface Group {
  id: number;
  account_id: number;
  name: string;
  link?: string;
  preferences: GroupPreference[];
}

interface UpdateGroupOptions extends GroupOptions {
  preferences: SubscriberPreference[];
}
