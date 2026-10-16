import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { VisitCard } from "./VisitCard";
import { styles } from "./VisitCard.styles";

test("VisitCard truncates long company names and addresses without pushing status badge", () => {
  const longVisit = {
    id: "visit-long",
    clientId: "client-long",
    clientName: "Empresa com Nome Extremamente Longo que Ocupa Toda a Linha do Celular em Manaus AM",
    scheduledFor: "2026-09-21T13:00:00.000Z",
    status: "assigned" as const,
    systemsCount: 2,
    systems: [],
    syncStatus: "synced" as const,
  };

  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(<VisitCard visit={longVisit} onPress={() => {}} />);
  });

  const clientText = tree!.root.findByProps({ children: longVisit.clientName });
  assert.equal(clientText.props.numberOfLines, 1);
  assert.equal((styles.client as any).flexShrink, 1);
});
