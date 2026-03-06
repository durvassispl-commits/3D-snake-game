import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Entry } from "../backend.d.ts";
import { useActor } from "./useActor";

export function useTopEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<Entry[]>({
    queryKey: ["topEntries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTopEntries();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function usePersonalBest(playerName: string) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["personalBest", playerName],
    queryFn: async () => {
      if (!actor || !playerName) return BigInt(0);
      return actor.getPersonalBest(playerName);
    },
    enabled: !!actor && !isFetching && playerName.trim().length > 0,
  });
}

export function useSubmitScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      playerName,
      score,
    }: {
      playerName: string;
      score: number;
    }) => {
      if (!actor) throw new Error("No actor");
      await actor.submitScore(playerName, BigInt(score));
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["topEntries"] });
      queryClient.invalidateQueries({
        queryKey: ["personalBest", variables.playerName],
      });
    },
  });
}
