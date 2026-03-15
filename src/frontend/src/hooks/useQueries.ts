import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message, Session } from "../backend.d";
import { useActor } from "./useActor";

export function useGetSessions() {
  const { actor, isFetching } = useActor();
  return useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMessages(sessionId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages", sessionId?.toString()],
    queryFn: async () => {
      if (!actor || sessionId === null) return [];
      return actor.getMessages(sessionId);
    },
    enabled: !!actor && !isFetching && sessionId !== null,
  });
}

export function useCreateSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createSession(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}

export function useAddMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      role,
      content,
    }: {
      sessionId: bigint;
      role: string;
      content: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addMessage(sessionId, role, content);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", vars.sessionId.toString()],
      });
    },
  });
}
