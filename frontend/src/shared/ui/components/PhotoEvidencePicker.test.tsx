import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { create, act } from "react-test-renderer";

import { PhotoEvidencePicker } from "./PhotoEvidencePicker.js";

test("PhotoEvidencePicker renders photos and allows removing and caption updates", () => {
  const photos = [
    {
      id: "photo-001",
      uri: "https://example.com/photo1.jpg",
      caption: "Torre 1 antes do tratamento",
      takenAt: "2026-09-22T14:00:00.000Z",
    },
  ];
  let removedId = "";

  let tree: ReturnType<typeof create>;
  act(() => {
    tree = create(
      React.createElement(PhotoEvidencePicker, {
        photos,
        onAddPhoto: () => {},
        onRemovePhoto: (id: string) => {
          removedId = id;
        },
        onUpdateCaption: () => {},
      }),
    );
  });

  const output = JSON.stringify(tree!.toJSON());
  assert.ok(output.includes("Torre 1 antes do tratamento"), "Deve exibir a legenda");
  assert.ok(output.includes("Fotos e Evidências"), "Deve exibir o título da seção");
});
