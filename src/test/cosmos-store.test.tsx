import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCosmosStore } from "@/lib/cosmos/useCosmosStore";

describe("COSMOS drawing and connection state", () => {
  beforeEach(() => localStorage.clear());

  it("creates strokes and connectors in the same undoable board state", async () => {
    const { result } = renderHook(() => useCosmosStore());
    await waitFor(() => expect(result.current.loaded).toBe(true));

    let firstNoteId = "";
    let noteId = "";
    act(() => {
      firstNoteId = result.current.add("note", 100, 100);
      noteId = result.current.add("note", 400, 100);
      result.current.addDrawing([{ x: 10, y: 10 }, { x: 80, y: 50 }], "#2563eb", 4);
      result.current.addConnector(firstNoteId, noteId);
    });

    expect(result.current.items.find((item) => item.type === "drawing")?.points).toHaveLength(2);
    expect(result.current.items.find((item) => item.type === "connector")).toMatchObject({ fromId: firstNoteId, toId: noteId });

    act(() => result.current.remove(firstNoteId));
    expect(result.current.items.some((item) => item.type === "connector")).toBe(false);
    act(() => result.current.undo());
    expect(result.current.items.some((item) => item.type === "connector")).toBe(true);
  });
});
