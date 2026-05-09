import { useInfiniteQuery } from "@tanstack/react-query";
import { useChatStore } from "@/stores/chat.store";
import { useEffect } from "react";
import { messageService } from "@/services/chat/chat.services";
import { Message } from "@/services/chat/chat.types";

const PAGE_SIZE = 20;

export function useMessages(roomId: string | null) {
  const setMessages = useChatStore((s) => s.setMessages);
  const prependMessages = useChatStore((s) => s.prependMessages);

  const query = useInfiniteQuery({
    queryKey: ["messages", roomId],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const res = await messageService.getMessages(roomId!, pageParam, PAGE_SIZE);
      return res.data.data; // Message[]
    },
    getNextPageParam: (lastPage: Message[]) => {
      // If we got a full page, the oldest message's id is the next cursor
      if (lastPage.length === PAGE_SIZE) {
        return lastPage[lastPage.length - 1].id;
      }
      return undefined; // no more pages
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!roomId,
  });

  // First page load → setMessages (replace)
  useEffect(() => {
    if (!roomId || !query.data) return;

    const pages = query.data.pages;
    if (pages.length === 0) return;

    if (pages.length === 1) {
      // Initial load
      const firstPage = pages[0];
      const nextCursor = firstPage.length === PAGE_SIZE ? firstPage[firstPage.length - 1].id : null;
      setMessages(roomId, firstPage, nextCursor, firstPage.length === PAGE_SIZE);
    } else {
      // Additional page loaded (scroll up) — prepend
      const latestPage = pages[pages.length - 1];
      const nextCursor = latestPage.length === PAGE_SIZE ? latestPage[latestPage.length - 1].id : null;
      prependMessages(roomId, latestPage, nextCursor, latestPage.length === PAGE_SIZE);
    }
  }, [query.data?.pages.length, roomId]); // eslint-disable-line

  return {
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isError: query.isError,
    error: query.error,
  };
}