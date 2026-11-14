import { readFileSync } from "node:fs";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";

// Execute the actual screen handlers without loading native modules into Node.
function handlers(overrides: Record<string, unknown> = {}) {
  const source = ts.createSourceFile("HomeScreen.tsx", readFileSync("src/screens/HomeScreen.tsx", "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const names = ["showMatchError", "handleMatch", "handleCityMatch", "runLocationMatch", "submitPrayer"];
  const bodies: string[] = [];
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name && names.includes(node.name.text)) bodies.push(node.getText(source));
    ts.forEachChild(node, visit);
  }
  visit(source);
  const env = {
    Alert: { alert: vi.fn() }, setStatus: vi.fn(), setMessage: vi.fn(), setMatch: vi.fn(),
    setPrayerReceipt: vi.fn(), setPrayerMessage: vi.fn(), prayerMessage: "Pedido de teste", prayerAnonymous: true,
    prayerRequests: { create: vi.fn().mockResolvedValue({request: {createdAt: "2026-11-14"}}) },
    selectedAreaIds: ["civil"], selectedStateId: "", selectedCityId: "", cities: [], status: "idle",
    setLocationConsentVisible: vi.fn(), locationConsentStorage: {hasConsented: vi.fn().mockResolvedValue(true)},
    requestDeviceLocation: vi.fn().mockResolvedValue({status: "granted", location: {lat: 0, lng: 0, accuracyM: 10}}),
    matches: {requestMatch: vi.fn().mockResolvedValue({status: "empty", lawyer: null})},
    navigation: {navigate: vi.fn()}, hasReliableDistance: () => false,
    getFriendlyError: () => "Tente novamente.", ...overrides
  };
  const js = ts.transpileModule(bodies.join("\n"), {compilerOptions: {target: ts.ScriptTarget.ES2022}}).outputText;
  return {...env, ...new Function(...Object.keys(env), `${js}; return {submitPrayer, runLocationMatch, handleMatch, handleCityMatch};`)(...Object.values(env))};
}

describe("visible action feedback", () => {
  it("confirms prayer only after the API succeeds", async () => {
    let resolve!: (value: unknown) => void;
    const h = handlers({prayerRequests: {create: () => new Promise(r => {resolve = r;})}});
    const sending = h.submitPrayer();
    expect(h.Alert.alert).not.toHaveBeenCalled();
    resolve({request: {createdAt: "2026-11-14"}});
    await sending;
    expect(h.Alert.alert).toHaveBeenCalledWith("Pedido de oração enviado", expect.any(String), [{text: "OK"}]);
    expect(h.setPrayerMessage).toHaveBeenCalledWith("");
  });
  it("keeps prayer text and presents failure when sending fails", async () => {
    const h = handlers({prayerRequests: {create: vi.fn().mockRejectedValue(new Error("offline"))}});
    await h.submitPrayer();
    expect(h.setPrayerMessage).not.toHaveBeenCalled();
    expect(h.setPrayerReceipt).not.toHaveBeenCalled();
    expect(h.Alert.alert).toHaveBeenCalledWith("Pedido não enviado", expect.any(String), [{text: "OK"}]);
  });
  it("presents an empty match and keeps the user on the search screen", async () => {
    const h = handlers();
    await h.runLocationMatch();
    expect(h.Alert.alert).toHaveBeenCalledWith("Nenhum advogado encontrado", expect.any(String), [{text: "OK"}]);
    expect(h.navigation.navigate).not.toHaveBeenCalled();
  });
  it("opens the profile without an empty-result alert when matched", async () => {
    const h = handlers({matches: {requestMatch: vi.fn().mockResolvedValue({status: "matched", lawyer: {id: "lawyer-1"}})}});
    await h.runLocationMatch();
    expect(h.navigation.navigate).toHaveBeenCalledWith("LawyerProfile", {lawyerId: "lawyer-1", distanceKm: undefined});
    expect(h.Alert.alert).not.toHaveBeenCalled();
  });
  it.each(["denied", "unavailable"])("alerts for %s location instead of leaving inline feedback", async status => {
    const h = handlers({requestDeviceLocation: vi.fn().mockResolvedValue({status})});
    await h.runLocationMatch();
    expect(h.Alert.alert).toHaveBeenCalledOnce();
    expect(h.matches.requestMatch).not.toHaveBeenCalled();
  });
  it("alerts when the location provider throws", async () => {
    const h = handlers({requestDeviceLocation: vi.fn().mockRejectedValue(new Error("provider"))});
    await h.runLocationMatch();
    expect(h.Alert.alert).toHaveBeenCalledOnce();
    expect(h.setStatus).toHaveBeenLastCalledWith("error");
  });
  it("alerts when the API request fails", async () => {
    const h = handlers({matches: {requestMatch: vi.fn().mockRejectedValue(new Error("offline"))}});
    await h.runLocationMatch();
    expect(h.Alert.alert).toHaveBeenCalledOnce();
    expect(h.navigation.navigate).not.toHaveBeenCalled();
  });
  it("alerts before requesting location when no specialty is selected", async () => {
    const h = handlers({selectedAreaIds: []});
    await h.handleMatch();
    expect(h.Alert.alert).toHaveBeenCalledOnce();
    expect(h.requestDeviceLocation).not.toHaveBeenCalled();
  });
  it("alerts for incomplete city selection without navigating", () => {
    const h = handlers();
    h.handleCityMatch();
    expect(h.Alert.alert).toHaveBeenCalledOnce();
    expect(h.navigation.navigate).not.toHaveBeenCalled();
  });
});
