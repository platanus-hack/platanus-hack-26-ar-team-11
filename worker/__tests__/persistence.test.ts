import { describe, expect, it } from "vitest";
import { shouldDedupUserTurn } from "../persistence";
import { parseRoomMetadata } from "../session-meta";

describe("shouldDedupUserTurn", () => {
  const at = (s: number) => new Date(s).toISOString();

  it("returns false when there is no previous turn", () => {
    expect(shouldDedupUserTurn(undefined, "Hola")).toBe(false);
  });

  it("returns false when the previous turn was assistant", () => {
    expect(
      shouldDedupUserTurn(
        { role: "assistant", at: at(1000), text: "Hola" },
        "Hola",
        2000
      )
    ).toBe(false);
  });

  it("dedups identical normalized text within the window", () => {
    expect(
      shouldDedupUserTurn(
        { role: "user", at: at(1000), text: "Juan Ignacio." },
        "juan ignacio",
        5000
      )
    ).toBe(true);
  });

  it("treats punctuation differences as duplicates", () => {
    expect(
      shouldDedupUserTurn(
        { role: "user", at: at(1000), text: "¿Hola?" },
        "Hola!",
        2000
      )
    ).toBe(true);
  });

  it("does not dedup once the window has elapsed", () => {
    expect(
      shouldDedupUserTurn(
        { role: "user", at: at(0), text: "Hola" },
        "hola",
        20_000
      )
    ).toBe(false);
  });

  it("does not dedup distinct text", () => {
    expect(
      shouldDedupUserTurn(
        { role: "user", at: at(1000), text: "Hola" },
        "Chau",
        2000
      )
    ).toBe(false);
  });
});

describe("parseRoomMetadata", () => {
  it("returns null for empty input", () => {
    expect(parseRoomMetadata(null)).toBeNull();
    expect(parseRoomMetadata("")).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    expect(parseRoomMetadata("{not json}")).toBeNull();
  });

  it("returns null when required fields are missing", () => {
    expect(
      parseRoomMetadata(JSON.stringify({ session_id: "s1", twin_id: "t1" }))
    ).toBeNull();
  });

  it("parses valid metadata with defaults for optional fields", () => {
    const out = parseRoomMetadata(
      JSON.stringify({
        session_id: "s1",
        twin_id: "t1",
        session_index: 2,
      })
    );
    expect(out).toEqual({
      session_id: "s1",
      twin_id: "t1",
      session_index: 2,
      target_domain: null,
      target_domains: [],
      avatar_enabled: true,
    });
  });

  it("respects avatar_enabled=false in metadata", () => {
    const out = parseRoomMetadata(
      JSON.stringify({
        session_id: "s1",
        twin_id: "t1",
        session_index: 0,
        avatar_enabled: false,
      })
    );
    expect(out?.avatar_enabled).toBe(false);
  });

  it("parses a fully populated payload", () => {
    const out = parseRoomMetadata(
      JSON.stringify({
        session_id: "s1",
        twin_id: "t1",
        session_index: 3,
        target_domain: "music_taste",
        target_domains: ["music_taste"],
      })
    );
    expect(out?.target_domain).toBe("music_taste");
    expect(out?.target_domains).toEqual(["music_taste"]);
  });
});
