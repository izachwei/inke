import { fetcher } from "@/lib/utils";
import useSWR from "swr";
import { User } from "@/lib/types/user";
import { ShareNote } from "@prisma/client";
import { IResponse } from "@/lib/types/response";

export function useUserInfoByEmail(email: string) {
  let api = `/api/users?email=${email}`;
  const { data, error, isLoading } = useSWR<User>(
    api,
    () =>
      fetcher(api, {
        method: "GET",
      }),
    { revalidateOnFocus: false },
  );

  return {
    user: data,
    isLoading,
    isError: error,
  };
}

export function useUserInfoById(id: string) {
  let api = `/api/users?id=${id}`;
  const { data, error, isLoading } = useSWR<User>(
    api,
    () =>
      fetcher(api, {
        method: "GET",
      }),
    { revalidateOnFocus: false },
  );

  return {
    user: data,
    isLoading,
    isError: error,
  };
}

export function useUserShareNotes() {
  let api = `/api/share/all`;
  const { data, error, isLoading } = useSWR<IResponse<ShareNote[]>>(
    api,
    () =>
      fetcher(api, {
        method: "GET",
      }),
    // { revalidateOnFocus: false },
  );

  return {
    shares: data,
    isLoading,
    isError: error,
  };
}

export function useShareNoteByLocalId(id: string) {
  const api = `/api/share?id=${id}`;
  const { data, error, isLoading } = useSWR<IResponse<ShareNote>>(
    api,
    () =>
      fetcher(api, {
        method: "GET",
      }),
    { revalidateOnFocus: false },
  );

  return {
    share: data,
    isLoading,
    isError: error,
  };
}
