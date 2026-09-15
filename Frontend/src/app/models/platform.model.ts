export interface PlatformData {
  codechef: string | null;
  codeforces: string | null;
  leetcode: string | null;
  atcoder: string | null;
}

export interface PlatformProfile {
  platform: string;
  username: string;
  last_fetched: string | null;
  status: string;
}

export interface PlatformResponse {
  platformData: {
    platform: PlatformData;
    last_fetched?: string | null;
  };
  profileData?: PlatformProfile[];
}

export interface PlatformUpdateResponse extends PlatformResponse {
  msg: string;
}